/** Real Manifest V3 integration, with all Instagram responses supplied by fixtures. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

async function waitFor(read, description) {
  for (let attempt = 0; attempt < 150; attempt++) {
    const value = await read();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${description}`);
}

async function main() {
  const extensionPath = path.resolve(__dirname, '..');
  const profilePath = await fs.mkdtemp(path.join(os.tmpdir(), 'unfollowtracker-browser-'));
  const context = await chromium.launchPersistentContext(profilePath, {
    channel: 'chromium',
    headless: true,
    reducedMotion: 'reduce',
    viewport: { width: 340, height: 720 },
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  let releaseInitialRequest = () => {};
  try {
    const [existingWorker] = context.serviceWorkers();
    const worker = existingWorker || await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).hostname;
    await worker.evaluate(() => chrome.storage.local.set({ language: 'en' }));
    assert.equal((await worker.evaluate(() => chrome.sidePanel.getPanelBehavior())).openPanelOnActionClick, true);
    const errors = [];
    context.on('page', (page) => page.on('pageerror', (error) => errors.push(error.message)));
    let mode = 'complete';
    let limited = false;
    const requests = [];
    let holdInitialRequest = true;
    const initialRequestGate = new Promise((resolve) => { releaseInitialRequest = resolve; });
    const user = (id) => ({ pk: id, username: `user${id}`, full_name: `User ${id}` });
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.protocol === 'chrome-extension:') return route.continue();
      // No request reaches Instagram or other external hosts during this test.
      if (url.origin !== 'https://www.instagram.com') return route.abort();
      if (!url.pathname.startsWith('/api/')) {
        return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Instagram fixture</title><p>Local test fixture</p>' });
      }
      requests.push(url.href);
      const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
      // Reproduces the live account: profile metadata fails while lists work.
      if (url.pathname.includes('/info/')) return reply({ status: 'fail' }, 429);
      if (url.pathname.includes('/following/')) {
        // Keep the first scan in flight until its restored state is inspected.
        // This tests persistence without racing page-open speed against fixture responses.
        if (holdInitialRequest) {
          holdInitialRequest = false;
          await initialRequestGate;
        }
        if (mode === 'cooldown' && !limited) {
          limited = true;
          return reply({}, 429);
        }
        if (!url.searchParams.has('max_id')) return reply({ users: [user(1)], next_max_id: 'next+/=&?', has_more: true });
        assert.equal(url.searchParams.get('max_id'), 'next+/=&?');
        return reply({ users: [user('1'), user(2)], has_more: false });
      }
      if (url.pathname.includes('/followers/')) {
        return mode === 'incomplete' ? reply({ status: 'fail' }) : reply({ users: [user('1')], has_more: false });
      }
      throw new Error(`Unexpected API request: ${url.pathname}`);
    });
    await context.addCookies([
      { name: 'ds_user_id', value: '100', url: 'https://www.instagram.com' },
      { name: 'csrftoken', value: 'fixture-token', url: 'https://www.instagram.com' },
    ]);
    const instagram = await context.newPage();
    await instagram.goto('https://www.instagram.com/');
    const tabId = await worker.evaluate(async () => (await chrome.tabs.query({ url: 'https://www.instagram.com/*' }))[0].id);
    await waitFor(() => worker.evaluate(async (id) => {
      try { return (await chrome.tabs.sendMessage(id, { action: 'getStatus' }))?.ok; } catch { return false; }
    }, tabId), 'content script installation');

    const openPopup = async () => {
      await instagram.bringToFront();
      const opened = context.waitForEvent('page');
      await worker.evaluate(async (url) => chrome.tabs.create({ url, active: false }), `chrome-extension://${extensionId}/src/popup.html`);
      const popup = await opened;
      await popup.waitForLoadState('domcontentloaded');
      await popup.waitForFunction(() => document.body.dataset.ready === 'true');
      return popup;
    };
    const saved = () => worker.evaluate(async () => (await chrome.storage.local.get('scanResult:100'))['scanResult:100']);
    const state = () => worker.evaluate(async () => (await chrome.storage.session.get('scanState:100'))['scanState:100']);

    let popup = await openPopup();
    assert.equal(await popup.locator('#scanBtn').isDisabled(), false);
    await popup.locator('#scanBtn').click();
    await waitFor(async () => (await state())?.status === 'scanning', 'scan start acknowledgement');
    await popup.close();
    popup = await openPopup();
    assert.equal(await popup.locator('#scanBtn').isDisabled(), true);
    releaseInitialRequest();
    await popup.close();
    const first = await waitFor(saved, 'save after popup closure');
    assert.deepEqual(first.unfollowers.map((entry) => entry.id), ['2']);
    assert.equal(requests.some((url) => url.includes('/info/')), false);
    popup = await openPopup();
    await popup.waitForFunction(() => document.getElementById('unfollowersCount').textContent === '1');
    assert.equal(await popup.locator('.user-item').count(), 1);
    assert.equal(await popup.locator('.user-item img').count(), 0);
    assert.equal(await popup.locator('.user-avatar-fallback').evaluate((element) => getComputedStyle(element).opacity), '1');
    const screenshot = path.join(os.tmpdir(), 'unfollowtracker-popup-success.png');
    await popup.screenshot({ path: screenshot, fullPage: true });
    console.log('PASS: real extension scans directly without the rate-limited profile endpoint, paginates and saves after popup closure');

    mode = 'incomplete';
    await popup.locator('#scanBtn').click();
    await waitFor(async () => (await state())?.status === 'error', 'failed refresh');
    await popup.waitForFunction(() => !document.getElementById('scanBtn').disabled);
    assert.equal((await saved()).scanId, first.scanId);
    assert.equal(await popup.locator('#progressSection').isVisible(), false);
    assert.match(await popup.locator('.status-text').textContent(), /could not complete/);
    assert.equal(await popup.locator('#unfollowersCount').textContent(), '1');
    console.log('PASS: failed refresh clears the spinner and preserves the previous complete scan');

    mode = 'cooldown';
    await worker.evaluate(async (id) => chrome.scripting.executeScript({
      target: { tabId: id },
      func: () => { globalThis.__unfollowTrackerScanner.config.rateLimitDelay = 1000; },
    }), tabId);
    await popup.locator('#scanBtn').click();
    await popup.waitForFunction(() => document.getElementById('progressText').textContent.includes('Retrying in'));
    await waitFor(async () => {
      const result = await saved();
      return result?.scanId !== first.scanId && result;
    }, 'rate-limited scan completion');
    await popup.waitForFunction(() => !document.getElementById('scanBtn').disabled);
    assert.equal(await popup.locator('#unfollowersCount').textContent(), '1');
    console.log('PASS: HTTP 429 displays a cooldown and resumes successfully');

    mode = 'complete';
    await popup.locator('#scanBtn').click();
    await waitFor(async () => (await state())?.status === 'scanning', 'scan before reload');
    await popup.close();
    await instagram.reload();
    await waitFor(async () => (await state())?.status === 'error', 'reload interruption');
    popup = await openPopup();
    assert.match(await popup.locator('.status-text').textContent(), /closed or reloaded/);
    assert.equal(await popup.locator('#unfollowersCount').textContent(), '1');
    assert.equal(await popup.locator('#scanBtn').isDisabled(), false);
    console.log('PASS: reloading Instagram reports the interruption without erasing saved results');

    await popup.close();
    await context.addCookies([{ name: 'ds_user_id', value: '200', url: 'https://www.instagram.com' }]);
    popup = await openPopup();
    assert.equal(await popup.locator('#unfollowersCount').textContent(), '--');
    assert.equal(await popup.locator('.user-item').count(), 0);
    // The window's panel reconnects without being closed, even after tab removal.
    await instagram.close();
    await popup.waitForFunction(() => !document.getElementById('connectSection').classList.contains('hidden'));
    assert.equal(await popup.locator('#scanBtn').isDisabled(), true);
    const beforeOpen = requests.length;
    await popup.locator('#openInstagramBtn').click();
    await popup.waitForFunction(() => !document.getElementById('scanBtn').disabled);
    assert.equal(requests.length, beforeOpen, 'Opening Instagram must not trigger a scan');
    await popup.locator('#languageSelect').selectOption('fr');
    await popup.waitForFunction(() => document.getElementById('scanBtn').textContent.includes('Scanner mon compte'));
    assert.equal(await popup.locator('html').getAttribute('lang'), 'fr');
    const reviewDir = path.join(extensionPath, '.impeccable/review');
    await fs.mkdir(reviewDir, { recursive: true });
    await popup.setViewportSize({ width: 360, height: 800 });
    await popup.screenshot({ path: path.join(reviewDir, 'panel-empty-fr.png'), fullPage: true });
    await popup.locator('#scanBtn').click();
    await popup.waitForFunction(() => document.getElementById('unfollowersCount').textContent === '1');
    await popup.screenshot({ path: path.join(reviewDir, 'panel-results-fr.png'), fullPage: true });
    await popup.locator('.btn-unfollow').click();
    assert.equal(await popup.locator('#confirmDialog').isVisible(), true);
    await popup.locator('#dialogCancel').click();
    assert.equal(await popup.locator('.user-item').count(), 1, 'Canceling confirmation must keep the result');
    await popup.locator('#languageSelect').selectOption('en');
    await popup.waitForFunction(() => document.documentElement.lang === 'en');
    await popup.locator('#themeToggle').click();
    await popup.screenshot({ path: path.join(reviewDir, 'panel-light-en.png'), fullPage: true });
    console.log('PASS: panel configuration, tab closure recovery, explicit open, language, theme and unfollow cancellation');
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log(`PASS: account caches are isolated; no page JavaScript errors (${requests.length} fixture API requests)`);
    console.log(`Popup screenshot: ${screenshot}`);
  } finally {
    releaseInitialRequest();
    await context.close();
    await fs.rm(profilePath, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
