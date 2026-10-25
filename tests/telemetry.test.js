const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness, json, user } = require('./harness');

const today = () => new Date().toISOString().slice(0, 10);
const events = (h) => h.analytics.map(({ body }) => body.name);
const props = (h, name) => h.analytics.find(({ body }) => body.name === name)?.body.props;

async function install(h, details = { reason: 'install' }) {
  h.installed.emit(details);
  await h.flush();
}

async function scan(h, tab) {
  const reply = await tab.send({ action: 'startScan', accountId: tab.accountId });
  assert.equal(reply.ok, true);
  await tab.scanner.scanPromise;
  await h.flush();
}

function lists(followingCount, followerIds) {
  return async (url) => json({
    status: 'ok',
    users: url.includes('/following/')
      ? Array.from({ length: followingCount }, (_, i) => user(i + 1))
      : followerIds.map((id) => user(id)),
  });
}

test('unpacked builds keep no counters, open no pages, set no survey and send nothing', async () => {
  const h = createHarness();
  await install(h);
  const tab = h.addTab({ fetch: lists(3, [1]) });
  await scan(h, tab);
  await h.popup();
  await h.flush();
  assert.deepEqual(h.analytics, []);
  assert.deepEqual(h.opened, []);
  assert.deepEqual(h.uninstallUrls, []);
  assert.equal(h.records.local.usage, undefined);
});

test('a store install sends one anonymous event, opens the welcome page and prepares the survey', async () => {
  const h = createHarness({ store: true, uiLanguage: 'fr' });
  await install(h);
  assert.equal(h.analytics.length, 1);
  const [{ url, options, body }] = h.analytics;
  assert.equal(url, 'https://analytics.krilup.com/api/event');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.deepEqual(body, {
    name: 'Install',
    domain: 'extension.unfollow.yadulink.com',
    url: 'app://unfollowtracker/install',
    props: { version: '1.2.0', browser: 'chrome', ui_lang: 'fr' },
  });
  assert.deepEqual(h.opened, ['https://unfollow.yadulink.com/fr/welcome/']);
  assert.equal(h.uninstallUrls.at(-1), `https://unfollow.yadulink.com/fr/uninstalled/?v=1.2.0&b=chrome&i=${today()}&s=0&x=none`);
});

test('a completed scan reports ranges only, never the account, usernames or exact counts', async () => {
  const h = createHarness({ store: true });
  await install(h);
  const tab = h.addTab({ accountId: '987654321', fetch: lists(150, [1, 2, 3]) });
  await scan(h, tab);
  assert.deepEqual(events(h), ['Install', 'Scan Start', 'Scan Complete']);
  assert.deepEqual(props(h, 'Scan Start'), { version: '1.2.0', browser: 'chrome', ui_lang: 'en', first: 'yes' });
  assert.deepEqual(props(h, 'Scan Complete'), {
    version: '1.2.0', browser: 'chrome', ui_lang: 'en',
    first: 'yes', followers: '0-99', following: '100-299', non_reciprocal: '50-199', duration: '0-1min', accounts: '1',
  });
  const sent = JSON.stringify(h.analytics.map(({ body }) => body));
  assert.doesNotMatch(sent, /987654321|user\d|User \d|"147"|"150"/);
  assert.match(h.uninstallUrls.at(-1), /&s=1&x=complete$/);

  await scan(h, tab);
  assert.equal(h.analytics.filter(({ body }) => body.name === 'Scan Complete').at(-1).body.props.first, 'no');
  assert.equal(h.records.local.usage.accounts, 1);
});

test('a failed scan is reported as a category, without the error text', async () => {
  const h = createHarness({ store: true });
  await install(h);
  const tab = h.addTab({ fetch: async () => json({}, 429) });
  await scan(h, tab);
  assert.deepEqual(events(h), ['Install', 'Scan Start', 'Scan Error']);
  assert.equal(props(h, 'Scan Error').error, 'rate_limited');
  assert.match(h.uninstallUrls.at(-1), /&s=0&x=error$/);
});

test('a scan interrupted by closing Instagram is counted once', async () => {
  const h = createHarness({ store: true });
  await install(h);
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const tab = h.addTab({ fetch: async (url) => { await pending; return lists(2, [1])(url); } });
  await tab.send({ action: 'startScan', accountId: tab.accountId });
  await h.flush();
  h.onRemoved.emit(tab.id);
  await h.flush();
  assert.deepEqual(events(h), ['Install', 'Scan Start', 'Scan Error']);
  assert.equal(props(h, 'Scan Error').error, 'tab_closed');
  release();
});

test('the panel reports one active day, export ranges and data deletion', async () => {
  const h = createHarness({ store: true });
  await install(h);
  h.records.local['scanResult:100'] = {
    accountId: '100', scanId: 'saved', complete: true, lastScan: 1, followers: [], following: [],
    unfollowers: Array.from({ length: 12 }, (_, i) => ({ id: String(i), username: `user${i}`, full_name: '' })),
  };
  h.addTab();
  let panel = await h.popup();
  await h.flush();
  panel.close();
  panel = await h.popup();
  await h.flush();
  assert.deepEqual(events(h), ['Install', 'Active']);
  assert.deepEqual(props(h, 'Active'), { version: '1.2.0', browser: 'chrome', ui_lang: 'en', age: '0d', scans: '0', accounts: '0' });
  assert.equal(h.records.local.usage.activeDay, today());

  panel.controller.exportResults();
  await h.flush();
  assert.equal(props(h, 'Export').count, '10-49');

  panel.controller.confirm = async () => true;
  await panel.controller.clearSavedData();
  await h.flush();
  assert.equal(events(h).at(-1), 'Clear Data');
  assert.equal(h.records.local.usage.accounts, 0);
});

test('turning statistics off stops events and removes details from the survey link', async () => {
  const h = createHarness({ store: true });
  await install(h);
  const panel = await h.popup();
  await h.flush();
  const toggle = panel.document.getElementById('statsToggle');
  assert.equal(toggle.checked, true);
  toggle.checked = false;
  toggle.dispatchEvent(new h.Event('change'));
  await h.flush();
  assert.equal(h.records.local.shareUsageStats, false);
  assert.equal(h.uninstallUrls.at(-1), 'https://unfollow.yadulink.com/en/uninstalled/?o=1');

  const sent = h.analytics.length;
  const tab = h.addTab({ fetch: lists(2, [1]) });
  await scan(h, tab);
  panel.controller.track('Export', { count: 3 });
  await h.flush();
  assert.equal(h.analytics.length, sent);
  assert.equal((await h.popup()).document.getElementById('statsToggle').checked, false);
});

test('updating from a version without statistics keeps the install date unknown', async () => {
  const h = createHarness({ store: true });
  h.records.local['scanResult:100'] = { accountId: '100', complete: true };
  h.records.local.language = 'fr';
  await install(h, { reason: 'update', previousVersion: '1.1.0' });
  assert.deepEqual(events(h), ['Update']);
  assert.equal(props(h, 'Update').from, '1.1.0');
  assert.deepEqual(h.opened, []);
  assert.deepEqual(h.records.local.usage, { installedAt: null, scans: 1, accounts: 1, lastScan: 'complete', activeDay: null });
  assert.equal(h.uninstallUrls.at(-1), 'https://unfollow.yadulink.com/fr/uninstalled/?v=1.2.0&b=chrome&i=0&s=1&x=complete');
});

test('content scripts and unknown events cannot report panel statistics', async () => {
  const h = createHarness({ store: true });
  await install(h);
  const listeners = [...h.background.chrome.runtime.onMessage.listeners];
  const fromTab = { id: 'extension-id', url: 'https://www.instagram.com/', tab: { id: 1 } };
  for (const listener of listeners) {
    assert.equal(listener({ action: 'telemetry', event: 'Active' }, fromTab, () => {}), false);
  }
  const panel = await h.popup();
  await h.flush();
  panel.controller.track('Install');
  panel.controller.track('Unfollow');
  await h.flush();
  assert.deepEqual(events(h), ['Install', 'Active']);
});
