/** Anonymous usage statistics. Never sends Instagram IDs, usernames, lists or page URLs. */
(() => {
  const endpoint = 'https://analytics.krilup.com/api/event';
  const domain = 'extension.unfollow.yadulink.com';
  const site = 'https://unfollow.yadulink.com';
  const panelEvents = new Set(['Active', 'Export', 'Clear Data']);
  const defaults = { installedAt: null, scans: 0, accounts: 0, lastScan: 'none', activeDay: null };

  // Ranges keep the account profile anonymous: exact counts never leave the browser.
  const range = (value, steps, top) => steps.find(([limit]) => value < limit)?.[1] ?? top;
  const listSize = (n) => range(n, [[100, '0-99'], [300, '100-299'], [1000, '300-999'], [3000, '1000-2999'],
    [10000, '3000-9999'], [50000, '10000-49999']], '50000+');
  const resultSize = (n) => range(n, [[1, '0'], [10, '1-9'], [50, '10-49'], [200, '50-199'], [1000, '200-999']], '1000+');
  const scanCount = (n) => range(n, [[1, '0'], [2, '1'], [6, '2-5'], [21, '6-20']], '21+');
  const accountCount = (n) => range(n, [[1, '0'], [2, '1'], [3, '2']], '3+');
  const duration = (ms) => range(ms / 60000, [[1, '0-1min'], [5, '1-5min'], [15, '5-15min']], '15min+');
  const age = (installedAt) => installedAt
    ? range((Date.now() - installedAt) / 86400000, [[1, '0d'], [7, '1-6d'], [30, '7-29d'], [90, '30-89d']], '90d+')
    : 'unknown';

  // Categories only: an error message is never forwarded as text.
  const errorTypes = [
    ['rate_limited', /limiting requests|HTTP 429/],
    ['verification', /sign in|verification/],
    ['hidden_list', /hiding part/],
    ['incomplete', /incomplete|stopped advancing|page limit/i],
    ['timeout', /too long/],
    ['account_changed', /account changed/],
    ['tab_closed', /closed or reloaded/],
    ['invalid_response', /invalid|unreadable|could not complete/],
    ['http_error', /HTTP \d{3}/],
    ['network', /fetch|network/i],
  ];
  const errorType = (message) => errorTypes.find(([, pattern]) => pattern.test(String(message)))?.[0] || 'other';

  function browser() {
    const brands = (navigator.userAgentData?.brands || []).map(({ brand }) => brand).join(' ');
    if (navigator.brave || /brave/i.test(brands)) return 'brave';
    if (/edge/i.test(brands)) return 'edge';
    if (/opera/i.test(brands)) return 'opera';
    if (/google chrome/i.test(brands)) return 'chrome';
    return /chromium/i.test(brands) ? 'chromium' : 'other';
  }

  function uiLanguage() {
    const value = chrome.i18n.getUILanguage();
    return /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(value) ? value : 'other';
  }

  async function usage() {
    const { usage: saved } = await chrome.storage.local.get('usage');
    return { ...defaults, ...saved };
  }

  async function saveUsage(changes) {
    const next = { ...(await usage()), ...changes };
    await chrome.storage.local.set({ usage: next });
    return next;
  }

  async function send(name, props = {}) {
    const { shareUsageStats } = await chrome.storage.local.get('shareUsageStats');
    if (shareUsageStats === false) return;
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name,
        domain,
        url: `app://unfollowtracker/${name.toLowerCase().replace(/ /g, '-')}`,
        props: { version: chrome.runtime.getManifest().version, browser: browser(), ui_lang: uiLanguage(), ...props },
      }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(10000),
    });
  }

  // Statistics must never delay or break a scan: callers don't wait for the network.
  function track(name, props) {
    send(name, props).catch(() => {});
  }

  async function language() {
    const { language: saved } = await chrome.storage.local.get('language');
    if (saved === 'fr' || saved === 'en') return saved;
    return uiLanguage().startsWith('fr') ? 'fr' : 'en';
  }

  async function refreshUninstallUrl() {
    const url = new URL(`${site}/${await language()}/uninstalled/`);
    const { shareUsageStats } = await chrome.storage.local.get('shareUsageStats');
    if (shareUsageStats === false) {
      url.searchParams.set('o', '1');
    } else {
      // The survey page turns the install date into a range before sending anything.
      const state = await usage();
      url.searchParams.set('v', chrome.runtime.getManifest().version);
      url.searchParams.set('b', browser());
      url.searchParams.set('i', state.installedAt ? new Date(state.installedAt).toISOString().slice(0, 10) : '0');
      url.searchParams.set('s', scanCount(state.scans));
      url.searchParams.set('x', state.lastScan);
    }
    await chrome.runtime.setUninstallURL(url.href);
  }

  async function installed({ reason, previousVersion }) {
    if (reason === 'install') {
      await chrome.storage.local.set({ usage: { ...defaults, installedAt: Date.now() } });
      track('Install');
    } else if (reason === 'update') {
      const { usage: saved, ...local } = await chrome.storage.local.get(null);
      if (!saved) {
        // Installed before statistics existed: the install date stays unknown.
        const accounts = Object.keys(local).filter((key) => key.startsWith('scanResult:')).length;
        await chrome.storage.local.set({ usage: { ...defaults, scans: accounts, accounts, lastScan: accounts ? 'complete' : 'none' } });
      }
      if (previousVersion !== chrome.runtime.getManifest().version) {
        track('Update', { from: /^\d+(\.\d+){0,3}$/.test(previousVersion) ? previousVersion : 'unknown' });
      }
    }
    await refreshUninstallUrl();
    if (reason === 'install') await chrome.tabs.create({ url: `${site}/${await language()}/welcome/` });
  }

  async function panelEvent({ event, count }) {
    if (!panelEvents.has(event)) return;
    if (event === 'Active') {
      const today = new Date().toISOString().slice(0, 10);
      const state = await usage();
      if (state.activeDay === today) return;
      await saveUsage({ activeDay: today });
      track('Active', { age: age(state.installedAt), scans: scanCount(state.scans), accounts: accountCount(state.accounts) });
    } else if (event === 'Export') {
      track('Export', { count: resultSize(Number.isSafeInteger(count) && count > 0 ? count : 0) });
    } else {
      await saveUsage({ accounts: 0 });
      track('Clear Data');
    }
  }

  async function scanStarted() {
    track('Scan Start', { first: (await usage()).scans ? 'no' : 'yes' });
  }

  async function scanCompleted(data, startedAt, newAccount) {
    const state = await usage();
    const next = await saveUsage({ scans: state.scans + 1, accounts: state.accounts + (newAccount ? 1 : 0), lastScan: 'complete' });
    track('Scan Complete', {
      first: state.scans ? 'no' : 'yes',
      followers: listSize(data.followers.length),
      following: listSize(data.following.length),
      non_reciprocal: resultSize(data.unfollowers.length),
      duration: startedAt ? duration(Date.now() - startedAt) : 'unknown',
      accounts: accountCount(next.accounts),
    });
    await refreshUninstallUrl();
  }

  async function scanFailed(message) {
    await saveUsage({ lastScan: 'error' });
    track('Scan Error', { error: errorType(message) });
    await refreshUninstallUrl();
  }

  // Unpacked and test builds have no update_url: no counters, survey or network.
  // A statistics failure is logged, never surfaced as a scan or panel error.
  const safe = (operation) => async (...args) => {
    if (!('update_url' in chrome.runtime.getManifest())) return;
    try {
      await operation(...args);
    } catch (error) {
      console.warn('[UnfollowTracker] Usage statistics skipped:', error);
    }
  };

  globalThis.TrackerTelemetry = {
    installed: safe(installed),
    panelEvent: safe(panelEvent),
    scanStarted: safe(scanStarted),
    scanCompleted: safe(scanCompleted),
    scanFailed: safe(scanFailed),
    unfollowed: safe(async () => track('Unfollow')),
    refreshUninstallUrl: safe(refreshUninstallUrl),
  };
})();
