/** Persist scans independently of the popup and serialize updates across tabs. */
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
      },
    });
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
      await chrome.storage.local.set({ [`scanResult:${message.accountId}`]: data });
      await chrome.storage.session.set({ [key]: { ...state, status: 'complete', progress: null } });
    } else if (message.type === 'scanProgress') {
      await chrome.storage.session.set({ [key]: { ...state, progress: message.data } });
    } else if (message.type === 'scanError') {
      await chrome.storage.session.set({ [key]: { ...state, status: 'error', error: message.error, progress: null } });
    }
  }
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  }).catch((error) => console.error('[UnfollowTracker] Could not update scan state:', error));
}

chrome.tabs.onRemoved.addListener((tabId) => interruptScans(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') interruptScans(tabId);
});
