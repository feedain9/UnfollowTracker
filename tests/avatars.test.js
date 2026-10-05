const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness');

const url = 'https://scontent-fixture.cdninstagram.com/photo.jpg';
const message = (overrides = {}) => ({ action: 'loadAvatar', accountId: '100', url, ...overrides });
const photo = () => new Response(new Uint8Array([255, 216, 255]), { headers: { 'content-type': 'image/jpeg' } });

test('photos use anonymous CORS in the Instagram tab and stay in memory without changing the scan', async () => {
  const h = createHarness();
  const saved = { complete: true, accountId: '100', marker: 'preserve this scan' };
  h.records.local['scanResult:100'] = saved;
  const tab = h.addTab({ fetch: async (requestedUrl, options) => {
    assert.equal(requestedUrl, url);
    assert.equal(options.mode, 'cors');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'strict-origin');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers, undefined);
    return photo();
  } });
  const loaded = await tab.send(message());
  assert.deepEqual(loaded, { ok: true, dataUrl: 'data:image/jpeg;base64,/9j/' });
  assert.deepEqual(await tab.send(message()), loaded);
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.records.local, { 'scanResult:100': saved });
  assert.deepEqual(h.records.session, {});
});

test('invalid photo destinations and mismatched accounts never issue a request', async () => {
  const h = createHarness();
  const tab = h.addTab();
  for (const value of [
    'https://cdninstagram.com.attacker.example/photo.jpg',
    'http://scontent.cdninstagram.com/photo.jpg',
    'https://user:secret@scontent.cdninstagram.com/photo.jpg',
    'https://scontent.cdninstagram.com:8080/photo.jpg',
    'data:image/png;base64,AA==', 'not a URL', '', null, 'https://scontent.cdninstagram.com/' + 'a'.repeat(4096),
  ]) assert.deepEqual(await tab.send(message({ url: value })), { ok: false });
  assert.deepEqual(await tab.send(message({ accountId: '200' })), { ok: false });
  tab.accountId = null;
  assert.deepEqual(await tab.send(message()), { ok: false });
  assert.equal(h.requests.length, 0);
});

test('unavailable, invalid and oversized images fall back once without retrying', async t => {
  const cases = [
    ['expired', () => new Response('Expired', { status: 403 })],
    ['HTML', () => new Response('<html>Error</html>', { headers: { 'content-type': 'text/html' } })],
    ['SVG', () => new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } })],
    ['empty', () => new Response('', { headers: { 'content-type': 'image/jpeg' } })],
    ['large declared size', () => new Response('', { headers: { 'content-type': 'image/jpeg', 'content-length': '9999999' } })],
    ['large stream', () => new Response(new Uint8Array(256 * 1024 + 1), { headers: { 'content-type': 'image/jpeg' } })],
    ['network failure', () => { throw new Error('CDN unavailable'); }],
  ];
  for (const [name, response] of cases) await t.test(name, async () => {
    const h = createHarness();
    const tab = h.addTab({ fetch: async () => response() });
    assert.deepEqual(await tab.send(message()), { ok: false });
    assert.deepEqual(await tab.send(message()), { ok: false });
    assert.equal(h.requests.length, 1);
  });
});

test('photo requests are deduplicated and no more than three downloads run together', async () => {
  const h = createHarness();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let active = 0;
  let peak = 0;
  const tab = h.addTab({ fetch: async () => {
    active++;
    peak = Math.max(peak, active);
    await gate;
    active--;
    return photo();
  } });
  const pending = Array.from({ length: 9 }, (_, id) => tab.send(message({ url: `${url}?photo=${id}` })));
  pending.push(tab.send(message({ url: `${url}?photo=0` })));
  assert.equal(h.requests.length, 3);
  release();
  assert.ok((await Promise.all(pending)).every(result => result.ok));
  assert.equal(h.requests.length, 9);
  assert.equal(peak, 3);
});

test('changing accounts discards pending photos and skips queued downloads for the old account', async () => {
  const h = createHarness();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const tab = h.addTab({ fetch: async () => { await gate; return photo(); } });
  const pending = Array.from({ length: 4 }, (_, id) => tab.send(message({ url: `${url}?photo=${id}` })));
  assert.equal(h.requests.length, 3);
  tab.accountId = '200';
  release();
  assert.ok((await Promise.all(pending)).every(result => !result.ok));
  assert.equal(h.requests.length, 3);
  assert.equal((await tab.send(message({ accountId: '200' }))).ok, true);
  assert.equal(tab.scanner.avatarCache.size, 1);
});

test('the photo cache has a fixed upper bound', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: async () => photo() });
  for (let id = 0; id < 65; id++) assert.equal((await tab.send(message({ url: `${url}?photo=${id}` }))).ok, true);
  assert.equal(tab.scanner.avatarCache.size, 64);
  assert.equal(tab.scanner.avatarCache.has(`${url}?photo=0`), false);
});

test('a hanging photo request times out once and releases its download slot', async () => {
  const h = createHarness();
  const tab = h.addTab({ fetch: (requestedUrl, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
  }) });
  tab.context.setTimeout = (callback, delay) => {
    assert.equal(delay, 10000);
    return setTimeout(callback, 1);
  };
  assert.deepEqual(await tab.send(message()), { ok: false });
  await h.flush();
  assert.equal(tab.scanner.activeAvatars, 0);
  assert.deepEqual(await tab.send(message()), { ok: false });
  assert.equal(h.requests.length, 1);
});

test('a photo finishing after the panel changes accounts cannot repopulate the old row', async () => {
  const h = createHarness();
  const users = [{ id: '2', username: 'fixture', full_name: 'Photo fixture', profile_pic_url: url }];
  h.records.local['scanResult:100'] = { accountId: '100', scanId: 'photo-test', complete: true, lastScan: 1, following: users, followers: [], unfollowers: users };
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const tab = h.addTab({ fetch: async () => { await gate; return photo(); } });
  const panel = await h.popup();
  const img = panel.document.querySelector('.user-avatar');
  const pending = img.onerror();
  assert.equal(h.requests.length, 1);
  tab.accountId = '200';
  await panel.controller.requestSync();
  release();
  await pending;
  assert.equal(panel.document.querySelectorAll('.user-item').length, 0);
  assert.equal(img.isConnected, false);
  assert.equal(img.src.startsWith('data:'), false);
});
