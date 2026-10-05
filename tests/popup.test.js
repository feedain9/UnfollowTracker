const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness, json, user } = require('./harness');

function snapshot(accountId = '100', unfollowers = [{ id: '2', username: 'user2', full_name: 'User Two' }]) {
  return { accountId, scanId: 'previous', complete: true, lastScan: 1700000000000, followers: [{ id: '1' }], following: [{ id: '1' }, ...unfollowers], unfollowers };
}

function response(url) {
  return json({ users: url.includes('/following/') ? [user(1), user(2)] : [user(1)] });
}

test('scan continues while popup is closed and reopening restores its progress and saved results', async () => {
  const h = createHarness();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const tab = h.addTab({ fetch: async (url) => { await pending; return response(url); } });
  let popup = await h.popup();
  await popup.controller.startScan();
  assert.equal(popup.controller.isScanning, true);
  popup.close();
  popup = await h.popup();
  assert.equal(popup.controller.isScanning, true);
  assert.equal(popup.document.getElementById('scanBtn').disabled, true);
  assert.equal(popup.document.getElementById('progressSection').classList.contains('hidden'), false);
  popup.close();
  release();
  await tab.scanner.scanPromise;
  await h.flush();
  popup = await h.popup();
  assert.equal(popup.controller.isScanning, false);
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '1');
  assert.match(popup.document.getElementById('scanBtn').textContent, /Refresh scan/);
  assert.match(popup.document.getElementById('scanDetails').textContent, /Last complete scan/);
  assert.equal(popup.document.querySelectorAll('.user-item').length, 1);
});

test('failed refresh clears the scanning status and progress, retaining the dated previous result', async () => {
  const h = createHarness();
  h.records.local['scanResult:100'] = snapshot();
  const tab = h.addTab({ fetch: async () => json({}, 401) });
  const popup = await h.popup();
  await popup.controller.startScan();
  await tab.scanner.scanPromise;
  await h.flush();
  assert.equal(popup.controller.isScanning, false);
  assert.equal(popup.document.getElementById('scanBtn').disabled, false);
  assert.equal(popup.document.getElementById('progressSection').classList.contains('hidden'), true);
  assert.equal(popup.document.getElementById('resultsSection').classList.contains('hidden'), false);
  assert.match(popup.document.querySelector('.status-text').textContent, /sign in/);
  assert.doesNotMatch(popup.document.querySelector('.status-text').textContent, /Scanning/);
  assert.equal(h.records.local['scanResult:100'].scanId, 'previous');
});

test('refresh after completion accepts the new scan ID and displays the new results', async () => {
  const h = createHarness();
  let empty = false;
  const tab = h.addTab({ fetch: async (url) => {
    if (!empty) return response(url);
    return json({ users: [] });
  } });
  const popup = await h.popup();
  await popup.controller.startScan();
  await tab.scanner.scanPromise;
  await h.flush();
  const firstScan = popup.controller.scanId;
  assert.equal(popup.controller.results.length, 1);
  empty = true;
  await popup.controller.startScan();
  await tab.scanner.scanPromise;
  await h.flush();
  assert.notEqual(popup.controller.scanId, firstScan);
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '0');
  assert.equal(popup.document.getElementById('followersCount').textContent, '0');
  assert.equal(popup.controller.results.length, 0);
  assert.match(popup.document.getElementById('resultsList').textContent, /Everyone you follow/);
  assert.equal(popup.document.getElementById('exportBtn').disabled, true);
});

test('a previously completed zero-result scan is restored on reopening', async () => {
  const h = createHarness();
  h.records.local['scanResult:100'] = snapshot('100', []);
  h.addTab();
  const popup = await h.popup();
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '0');
  assert.equal(popup.document.getElementById('resultsSection').classList.contains('hidden'), false);
});

test('the cooldown keeps the affected list visible after reopening the popup', async () => {
  const h = createHarness();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  let blocked = false;
  const tab = h.addTab({ fetch: async (url) => {
    if (url.includes('/followers/') && !blocked) {
      blocked = true;
      return json({}, 429);
    }
    return response(url);
  } });
  const originalSleep = tab.scanner.sleep;
  tab.scanner.sleep = async (ms) => { if (ms === 1000) await pending; else await originalSleep(ms); };
  let popup = await h.popup();
  await popup.controller.startScan();
  await h.flush();
  popup.close();
  popup = await h.popup();
  assert.match(popup.document.getElementById('progressText').textContent, /Fetching followers.*Retrying in 30s/);
  assert.equal(popup.document.getElementById('scanBtn').disabled, true);
  release();
  await tab.scanner.scanPromise;
  await h.flush();
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '1');
});

test('ignores legacy unowned cache, another account cache, and messages from unrelated tabs', async () => {
  const h = createHarness();
  h.records.local.unfollowers = [{ username: 'legacy-user' }];
  h.records.local['scanResult:200'] = snapshot('200');
  h.addTab();
  const second = h.addTab({ id: 2, accountId: '200' });
  const popup = await h.popup();
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '--');
  await second.context.chrome.runtime.sendMessage({ type: 'scanComplete', accountId: '200', scanId: 'other', data: snapshot('200') });
  await second.context.chrome.runtime.sendMessage({ type: 'scanComplete', accountId: '100', scanId: 'other', data: snapshot() });
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '--');
  assert.equal(popup.controller.results.length, 0);
});

test('an existing tab without a content script is initialized once', async () => {
  const h = createHarness();
  const tab = h.addTab({ connected: false });
  const popup = await h.popup();
  assert.equal(popup.controller.isConnected, true);
  assert.equal(tab.messages.listeners.size, 1);
  assert.equal(popup.document.getElementById('scanBtn').disabled, false);
});

test('the Instagram domain check rejects unrelated sites and signed-out sessions', async (t) => {
  for (const url of ['https://instagram.com.example.org/', 'https://example.org/?instagram.com']) {
    await t.test(url, async () => {
      const h = createHarness();
      const tab = h.addTab();
      tab.url = url;
      const popup = await h.popup();
      assert.equal(popup.controller.isConnected, false);
      assert.equal(popup.document.getElementById('scanBtn').disabled, true);
    });
  }
  await t.test('signed out', async () => {
    const h = createHarness();
    h.addTab({ accountId: null });
    const popup = await h.popup();
    assert.equal(popup.document.getElementById('scanBtn').disabled, true);
    assert.match(popup.document.querySelector('.status-text').textContent, /Sign in/);
  });
});

test('an interrupted scan is reported on reopening, without erasing the completed snapshot', async () => {
  const h = createHarness();
  h.records.local['scanResult:100'] = snapshot();
  h.records.session['scanState:100'] = { accountId: '100', tabId: 1, scanId: 'abandoned', status: 'scanning' };
  h.addTab();
  const popup = await h.popup();
  assert.match(popup.document.querySelector('.status-text').textContent, /interrupted/);
  assert.equal(popup.document.getElementById('unfollowersCount').textContent, '1');
  assert.equal(popup.document.getElementById('scanBtn').disabled, false);
});

test('unfollow errors are shown and never mark the account as unfollowed', async () => {
  const h = createHarness();
  h.records.local['scanResult:100'] = snapshot();
  h.addTab({ fetch: async () => json({ status: 'fail' }) });
  const popup = await h.popup();
  const row = popup.document.querySelector('.user-item');
  await popup.controller.unfollowUser(popup.controller.results[0], row);
  assert.equal(popup.controller.results.length, 1);
  assert.equal(popup.document.querySelector('.btn-unfollow').textContent, 'Unfollow');
  assert.match(popup.document.querySelector('.status-text').textContent, /could not complete/);
});

test('account names render as text and missing avatar URLs render initials without a broken image', async () => {
  const h = createHarness();
  const hostileName = '<img src=x onerror=alert(1)>';
  h.records.local['scanResult:100'] = snapshot('100', [{ id: '2', username: 'user2', full_name: hostileName }]);
  h.addTab();
  const popup = await h.popup();
  assert.equal(popup.document.querySelector('.user-name').textContent, hostileName);
  assert.equal(popup.document.querySelectorAll('.user-item img').length, 0);
  assert.ok(popup.document.querySelector('.user-avatar-fallback').textContent.length > 0);
});
