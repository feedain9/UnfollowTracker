/** Persist scans independently of the popup and serialize updates across tabs. */
importScripts('telemetry.js');
const telemetry = globalThis.TrackerTelemetry;
let updateQueue = Promise.resolve();

// A global panel stays available when the active tab changes.
chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
  console.error('[UnfollowTracker] Could not configure the side panel:', error);
});

function enqueueUpdate(operation) {
  const pending = updateQueue.then(operation);
  updateQueue = pending.catch(() => {});
  return pending;
}

async function handleScanMessage(message, sender) {
  if (!sender.tab || sender.frameId !== 0 || new URL(sender.url).origin !== 'https://www.instagram.com' ||
      !/^\d+$/.test(message.accountId) || typeof message.scanId !== 'string') {
    throw new Error('Invalid scan message.');
  }
  const key = `scanState:${message.accountId}`;
  const state = (await chrome.storage.session.get(key))[key];
  const ownsScan = state?.scanId === message.scanId && state.tabId === sender.tab.id;

  if (message.action === 'registerScan') {
    if (state?.status === 'scanning') {
      let active;
      try {
        active = await chrome.tabs.sendMessage(state.tabId, { action: 'getStatus' });
      } catch {
        // Closed/reloaded tabs no longer own a live scan.
      }
      if (active?.isScanning && active.scanId === state.scanId) {
        throw new Error('A scan is already running in another Instagram tab. Wait for it to finish.');
      }
    }
    await chrome.storage.session.set({
      [key]: {
        accountId: message.accountId,
        scanId: message.scanId,
        tabId: sender.tab.id,
        status: 'scanning',
        progress: null,
        startedAt: Date.now(),
      },
    });
    await telemetry.scanStarted();
  } else if (message.action === 'unfollowComplete') {
    const resultKey = `scanResult:${message.accountId}`;
    const result = (await chrome.storage.local.get(resultKey))[resultKey];
    if (!result?.complete || result.scanId !== message.scanId) {
      throw new Error('Instagram confirmed the unfollow, but the saved scan changed. Run a new scan to refresh your results.');
    }
    const data = {
      ...result,
      following: result.following.filter((user) => user.id !== message.userId),
      unfollowers: result.unfollowers.filter((user) => user.id !== message.userId),
    };
    await chrome.storage.local.set({ [resultKey]: data });
    await telemetry.unfollowed();
    return { ok: true, data };
  } else {
    if (!ownsScan || state.status !== 'scanning') {
      throw new Error('This scan was interrupted. Run a new scan to refresh your results.');
    }
    if (message.action === 'saveScan') {
      const data = message.data;
      if (!data?.complete || data.accountId !== message.accountId || data.scanId !== message.scanId ||
          !['followers', 'following', 'unfollowers'].every((field) => Array.isArray(data[field]))) {
        throw new Error('Incomplete scan results were not saved.');
      }
      const resultKey = `scanResult:${message.accountId}`;
      // Sizes only: counts saved accounts without reading their lists.
      const newAccount = !(await chrome.storage.local.getBytesInUse(resultKey));
      await chrome.storage.local.set({ [resultKey]: data });
      await chrome.storage.session.set({ [key]: { ...state, status: 'complete', progress: null } });
      await telemetry.scanCompleted(data, state.startedAt, newAccount);
    } else if (message.type === 'scanProgress') {
      await chrome.storage.session.set({ [key]: { ...state, progress: message.data } });
    } else if (message.type === 'scanError') {
      await chrome.storage.session.set({ [key]: { ...state, status: 'error', error: message.error, progress: null } });
      await telemetry.scanFailed(message.error);
    }
  }
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'telemetry') {
    // Only the extension's own panel reports panel events; content scripts can't.
    if (sender.tab || sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL('src/'))) return false;
    enqueueUpdate(() => telemetry.panelEvent(message)).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (!['registerScan', 'saveScan', 'unfollowComplete'].includes(message.action) &&
      !['scanProgress', 'scanError'].includes(message.type)) return false;
  enqueueUpdate(() => handleScanMessage(message, sender)).then(
    sendResponse,
    (error) => sendResponse({ ok: false, error: error.message }),
  );
  // Content messages already reach the popup. Forwarding duplicates events and
  // loses the sender tab needed to isolate different Instagram accounts.
  return true;
});

function interruptScans(tabId) {
  return enqueueUpdate(async () => {
    const states = await chrome.storage.session.get(null);
    const updates = {};
    for (const [key, state] of Object.entries(states)) {
      if (key.startsWith('scanState:') && state.tabId === tabId && state.status === 'scanning') {
        updates[key] = {
          ...state,
          status: 'error',
          progress: null,
          error: 'The Instagram tab was closed or reloaded. Run a new scan; your last complete results are preserved.',
        };
      }
    }
    if (Object.keys(updates).length) await chrome.storage.session.set(updates);
    for (const state of Object.values(updates)) await telemetry.scanFailed(state.error);
  }).catch((error) => console.error('[UnfollowTracker] Could not update scan state:', error));
}

chrome.tabs.onRemoved.addListener((tabId) => interruptScans(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') interruptScans(tabId);
});

chrome.runtime.onInstalled.addListener((details) => {
  enqueueUpdate(() => telemetry.installed(details));
});
// The uninstall survey link carries the current anonymous counters and opt-out.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && ('shareUsageStats' in changes || 'language' in changes)) {
    enqueueUpdate(() => telemetry.refreshUninstallUrl());
  }
});
enqueueUpdate(() => telemetry.refreshUninstallUrl());
