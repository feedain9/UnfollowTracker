const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness, json, user } = require('./harness');

async function scan(harness, tab) {
  const reply = await tab.send({ action: 'startScan', accountId: tab.accountId });
  assert.equal(reply.ok, true);
  await tab.scanner.scanPromise;
  await harness.flush();
  return harness.records.local[`scanResult:${tab.accountId}`];
}

function pages({ following = [user(1), user(2)], followers = [user('1')] } = {}) {
  return async (url) => {
    assert.match(url, /\/friendships\/\d+\/(following|followers)\//);
    return json({ status: 'ok', users: url.includes('/following/') ? following : followers });
  };
}

test('live regression: scan succeeds when profile info always returns 429 and the lists remain accessible', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: async (url) => url.includes('/info/') ? json({}, 429) : pages()(url) });
  const result = await scan(h, tab);
  assert.equal(result.accountId, '100');
  assert.deepEqual(result.unfollowers.map((entry) => entry.id), ['2']);
  assert.deepEqual(h.requests.map(({url}) => new URL(url).pathname), [
    '/api/v1/friendships/100/following/', '/api/v1/friendships/100/followers/',
  ]);
  assert.equal(h.notifications.some((message) => message.data?.retryInSeconds), false);
});

test('paginates short pages, encodes cursors, deduplicates users and normalizes pk_id/string/number IDs', async () => {
  const h = createHarness();
  const cursor = 'next+/=&?';
  const tab = h.addTab({ fetch: async (url, options) => {
    assert.equal(options.headers['X-IG-App-ID'], '936619743392459');
    assert.equal(options.headers['X-ASBD-ID'], '129477');
    assert.equal(options.headers['X-CSRFToken'], 'test-token');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    if (url.includes('/followers/')) return json({ users: [user(1, { pk_id: '9007199254740993' })] });
    if (!new URL(url).searchParams.has('max_id')) {
      return json({ users: [user(9007199254740992, { pk_id: '9007199254740993' }), user(2)], next_max_id: cursor, has_more: true });
    }
    assert.equal(new URL(url).searchParams.get('max_id'), cursor);
    return json({ users: [user('2'), user('3')], next_max_id: 'ignored', has_more: false });
  } });
  const result = await scan(h, tab);
  assert.equal(result.following.length, 3);
  assert.deepEqual(result.unfollowers.map((entry) => entry.id), ['2', '3']);
  assert.equal(h.requests.length, 3);
});

test('retries the same rate-limited page, honors Retry-After and announces the cooldown', async () => {
  const h = createHarness();
  let attempts = 0;
  const tab = h.addTab({ fetch: async (url) => {
    if (url.includes('/following/') && attempts++ < 1) return json({}, 429, { 'Retry-After': '35' });
    return pages()(url);
  } });
  const result = await scan(h, tab);
  assert.equal(result.unfollowers.length, 1);
  assert.equal(attempts, 2);
  assert.equal(tab.sleeps.filter((ms) => ms === 1000).length, 35);
  assert.ok(h.notifications.some((message) => message.data?.retryInSeconds === 35));
});

test('repeated 429 stops after three retries and preserves the last complete snapshot', async () => {
  const h = createHarness();
  const previous = { marker: 'previous complete scan' };
  h.records.local['scanResult:100'] = previous;
  const tab = h.addTab({ fetch: async () => json({}, 429) });
  const result = await scan(h, tab);
  assert.deepEqual(result, previous);
  assert.equal(h.requests.length, 4);
  assert.match(tab.scanner.error, /limiting requests/);
  assert.match(tab.scanner.error, /following list \(HTTP 429\)/);
  assert.equal(tab.scanner.isScanning, false);
  assert.equal(tab.scanner.progress, null);
  assert.equal(h.records.session['scanState:100'].status, 'error');
  assert.equal(tab.sleeps.reduce((total, ms) => total + ms, 0), 210000);
});

test('does not retry before a long Retry-After or on authentication/verification failures', async (t) => {
  const cases = [
    ['long cooldown', () => json({}, 429, { 'Retry-After': '3600' }), /limiting requests/],
    ['login', () => json({}, 401), /sign in/],
    ['challenge', () => json({ status: 'fail', message: 'challenge_required' }), /verification/],
    ['HTTP 403 challenge', () => json({ status: 'fail', message: 'challenge_required' }, 403), /verification/],
    ['invalid JSON', () => new Response('<html>Login</html>'), /unreadable/],
  ];
  for (const [name, response, error] of cases) {
    await t.test(name, async () => {
      const h = createHarness();
      const tab = h.addTab({ fetch: async () => response() });
      assert.equal(await scan(h, tab), undefined);
      assert.equal(h.requests.length, 1);
      assert.match(tab.scanner.error, error);
    });
  }
});

test('a hanging request times out and clears the scanning state', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: async (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }) });
  tab.scanner.config.requestTimeout = 5;
  assert.equal(await scan(h, tab), undefined);
  assert.equal(tab.scanner.isScanning, false);
  assert.match(tab.scanner.error, /too long/);
});

test('malformed or partial followers never replace an existing completed result', async (t) => {
  const cases = [
    ['missing users', { status: 'ok' }],
    ['soft failure', { status: 'fail', users: [] }],
    ['restricted empty list', { users: [], should_limit_list_of_followers: true }],
    ['missing ID', { users: [{ username: 'missing_id' }] }],
    ['unsafe numeric ID', { users: [user(9007199254740992)] }],
    ['missing cursor', { users: [], has_more: true }],
  ];
  for (const [name, payload] of cases) {
    await t.test(name, async () => {
      const h = createHarness();
      h.records.local['scanResult:100'] = { marker: 'keep' };
      const tab = h.addTab({ fetch: async (url) => url.includes('/followers/') ? json(payload) : pages()(url) });
      assert.deepEqual(await scan(h, tab), { marker: 'keep' });
      assert.equal(h.notifications.some((message) => message.type === 'scanComplete'), false);
      assert.equal(h.records.session['scanState:100'].status, 'error');
    });
  }
});

test('detects a repeated cursor, duplicate page and page limit without claiming success', async (t) => {
  for (const mode of ['cursor', 'duplicate', 'limit', 'empty']) {
    await t.test(mode, async () => {
      const h = createHarness();
      let page = 0;
      const tab = h.addTab({ fetch: async (url) => {
        page++;
        return json({ users: mode === 'empty' ? [] : [user(mode === 'duplicate' ? 1 : page)], next_max_id: mode === 'cursor' ? 'same' : String(page), has_more: true });
      } });
      tab.scanner.config.pageLimits.following = 3;
      assert.equal(await scan(h, tab), undefined);
      assert.match(tab.scanner.error, /incomplete|Incomplete/);
      assert.ok(h.requests.length <= 3);
    });
  }
});

test('has_more=true without a next cursor never passes as a complete list', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: async (url) => {
    const response = await pages()(url);
    return json({ ...await response.json(), has_more: true });
  } });
  assert.equal(await scan(h, tab), undefined);
  assert.match(tab.scanner.error, /incomplete following list/);
});

test('explicitly restricted lists never replace a complete result, including non-empty pages', async (t) => {
  for (const [kind, restriction] of [
    ['following', { should_limit_list_of_followings: true }],
    ['followers', { should_limit_list_of_followers: true }],
    ['following', { hidden_following_account_count: 2 }],
  ]) {
    await t.test(`${kind}: ${Object.keys(restriction)[0]}`, async () => {
      const h = createHarness();
      h.records.local['scanResult:100'] = { marker: 'previous' };
      const tab = h.addTab({ fetch: async (url) => {
        const response = await pages()(url);
        return json({ ...await response.json(), ...(url.includes(`/${kind}/`) ? restriction : {}) });
      } });
      assert.deepEqual(await scan(h, tab), { marker: 'previous' });
      assert.match(tab.scanner.error, /hiding part/);
      assert.equal(h.notifications.some((message) => message.type === 'scanComplete'), false);
    });
  }
});

test('a session change mid-scan aborts without mixing data from two accounts', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: async (url) => {
    if (url.includes('/following/')) tab.accountId = '200';
    return pages()(url);
  } });
  await scan(h, tab);
  assert.equal(h.records.local['scanResult:100'], undefined);
  assert.equal(h.records.local['scanResult:200'], undefined);
  assert.equal(h.requests.length, 1);
  assert.match(tab.scanner.error, /account changed/);
});

test('start acknowledges immediately; duplicate starts and reinjection do not create another scan', async () => {
  const h = createHarness();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const tab = h.addTab({ fetch: async (url) => { await pending; return pages()(url); } });
  const first = await tab.send({ action: 'startScan', accountId: '100' });
  const second = await tab.send({ action: 'startScan', accountId: '100' });
  h.inject(tab);
  assert.equal(first.scanId, second.scanId);
  assert.equal(tab.messages.listeners.size, 1);
  assert.equal(tab.scanner.isScanning, true);
  release();
  await tab.scanner.scanPromise;
  await h.flush();
  assert.equal(h.requests.length, 2);
  assert.equal(h.records.local['scanResult:100'].complete, true);
});

test('another tab cannot start a concurrent scan for the same account', async () => {
  const h = createHarness();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const first = h.addTab({ fetch: async (url) => { await pending; return pages()(url); } });
  const second = h.addTab({ id: 2, fetch: pages() });
  await first.send({ action: 'startScan', accountId: '100' });
  await h.flush();
  await scan(h, second);
  assert.match(second.scanner.error, /another Instagram tab/);
  assert.equal(h.requests.filter((request) => request.tabId === 2).length, 0);
  assert.equal(h.records.session['scanState:100'].scanId, first.scanner.scanId);
  release();
  await first.scanner.scanPromise;
  await h.flush();
});

test('closing/reloading a tab interrupts its scan, rejects late results and preserves previous data', async () => {
  const h = createHarness();
  h.records.local['scanResult:100'] = { marker: 'previous' };
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const tab = h.addTab({ fetch: async (url) => { await pending; return pages()(url); } });
  await tab.send({ action: 'startScan', accountId: '100' });
  await h.flush();
  h.onUpdated.emit(1, { status: 'loading' });
  await h.flush();
  assert.equal(h.records.session['scanState:100'].status, 'error');
  release();
  await tab.scanner.scanPromise;
  await h.flush();
  assert.deepEqual(h.records.local['scanResult:100'], { marker: 'previous' });
  assert.equal(h.notifications.some((message) => message.type === 'scanComplete'), false);
});

test('zero non-followers is a completed, persisted scan, including an empty account', async (t) => {
  for (const list of [[], [user(1)]]) {
    await t.test(`${list.length} followers`, async () => {
      const h = createHarness();
      const tab = h.addTab({ fetch: pages({ following: list, followers: list }) });
      const result = await scan(h, tab);
      assert.equal(result.complete, true);
      assert.deepEqual(result.unfollowers, []);
    });
  }
});

test('unfollow requires Instagram confirmation and only then updates persisted counts', async (t) => {
  for (const confirmed of [false, true]) {
    await t.test(confirmed ? 'confirmed' : 'rejected', async () => {
      const h = createHarness();
      const tab = h.addTab({ fetch: async (url) => url.includes('/destroy/')
        ? json({ status: 'ok', friendship_status: { following: !confirmed } })
        : pages()(url) });
      const snapshot = await scan(h, tab);
      const response = await tab.send({ action: 'unfollow', accountId: '100', scanId: snapshot.scanId, userId: '2', username: 'user2' });
      assert.equal(response.ok, confirmed);
      assert.equal(h.records.local['scanResult:100'].unfollowers.length, confirmed ? 0 : 1);
      assert.equal(h.records.local['scanResult:100'].following.length, confirmed ? 1 : 2);
    });
  }
});

test('unfollow rejects account mismatch and stale results before making a POST', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: pages() });
  const snapshot = await scan(h, tab);
  for (const change of [{ accountId: '200' }, { scanId: 'stale' }, { userId: '1' }]) {
    const reply = await tab.send({ action: 'unfollow', accountId: '100', scanId: snapshot.scanId, userId: '2', username: 'user2', ...change });
    assert.equal(reply.ok, false);
  }
  assert.equal(h.requests.some(({ options }) => options.method === 'POST'), false);
});
