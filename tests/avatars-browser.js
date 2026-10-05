/** Regression for profile images loaded from an extension origin. No live requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '..');
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'unfollowtracker-avatars-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true, reducedMotion: 'reduce',
    viewport: { width: 420, height: 960 },
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`],
  });
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).hostname;
    const photo = await fs.readFile(path.join(root, 'site/assets/mountains.jpg'));
    const requested = [];
    const rejected = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.protocol === 'chrome-extension:') return route.continue();
      if (url.origin === 'https://www.instagram.com' && url.pathname === '/') {
        return route.fulfill({ contentType: 'text/html', body: '<title>Instagram test fixture</title>' });
      }
      requested.push({ url: url.href, origin: route.request().headers().origin });
      if (url.href === 'https://scontent-fixture.cdninstagram.com/avatar.jpg') {
        // Matches the observed CDN behavior: embedding outside Instagram is
        // refused, while a CORS request from the Instagram tab is accepted.
        if (route.request().headers().origin !== 'https://www.instagram.com') {
          return route.fulfill({ status: 403, body: 'Image unavailable in this context', headers: { 'cross-origin-resource-policy': 'same-origin' } });
        }
        assert.equal(route.request().headers().referer, 'https://www.instagram.com/');
        assert.equal(route.request().headers().cookie, undefined);
        assert.equal(route.request().headers()['x-csrftoken'], undefined);
        return route.fulfill({
          contentType: 'image/jpeg', body: photo,
          headers: { 'cross-origin-resource-policy': 'cross-origin', 'access-control-allow-origin': 'https://www.instagram.com' },
        });
      }
      if (url.href === 'https://scontent-fixture.cdninstagram.com/direct.jpg') {
        return route.fulfill({ contentType: 'image/jpeg', body: photo });
      }
      if (url.href === 'https://scontent-fixture.xx.fbcdn.net/expired.jpg') {
        return route.fulfill({ status: 403, body: 'Expired image', headers: { 'access-control-allow-origin': '*' } });
      }
      rejected.push(url.href);
      return route.abort();
    });
    await context.addCookies([{ name: 'ds_user_id', value: '100', url: 'https://www.instagram.com' }]);
    const users = [
      { id: '2', username: 'demo_landscape', full_name: 'Photo disponible', profile_pic_url: 'https://scontent-fixture.cdninstagram.com/avatar.jpg' },
      { id: '3', username: 'demo_expired', full_name: 'Photo expirée', profile_pic_url: 'https://scontent-fixture.xx.fbcdn.net/expired.jpg' },
      { id: '4', username: 'demo_without_photo', full_name: 'Photo absente', profile_pic_url: '' },
      { id: '5', username: 'demo_untrusted', full_name: 'Adresse non autorisée', profile_pic_url: 'https://cdninstagram.com.example.invalid/pixel.jpg' },
      { id: '6', username: 'demo_direct', full_name: 'Photo directe', profile_pic_url: 'https://scontent-fixture.cdninstagram.com/direct.jpg' },
    ];
    const snapshot = { accountId: '100', scanId: 'avatar-fixture', complete: true, lastScan: 1700000000000, following: users, followers: [], unfollowers: users };
    await worker.evaluate(data => chrome.storage.local.set({ language: 'fr', 'scanResult:100': data }), snapshot);
    const instagram = await context.newPage();
    await instagram.goto('https://www.instagram.com/');
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/src/popup.html`);
    await panel.waitForFunction(() => document.body.dataset.ready === 'true');
    await panel.locator('.user-item').first().scrollIntoViewIfNeeded();
    await panel.waitForFunction(() => {
      const image = document.querySelector('.user-item:first-child img');
      return image && image.complete && image.naturalWidth > 0 && getComputedStyle(image).opacity === '1';
    }, null, { timeout: 5000 });
    const rows = panel.locator('.user-item');
    assert.equal(await rows.count(), 5);
    assert.equal(await rows.nth(0).locator('.user-avatar-fallback').evaluate(node => getComputedStyle(node).opacity), '0');
    for (let index = 1; index < 4; index++) {
      await rows.nth(index).scrollIntoViewIfNeeded();
      await rows.nth(index).locator('img').waitFor({ state: 'detached' });
      assert.equal(await rows.nth(index).locator('.user-avatar-fallback').evaluate(node => getComputedStyle(node).opacity), '1');
    }
    assert.equal(rejected.length, 0, rejected.join('\n'));
    await rows.nth(4).scrollIntoViewIfNeeded();
    await rows.nth(4).locator('img').evaluate(img => img.decode());
    assert.equal(await rows.nth(4).locator('.user-avatar-fallback').evaluate(node => getComputedStyle(node).opacity), '0');
    assert.equal(requested.filter(({ url }) => url.endsWith('/avatar.jpg')).length, 2);
    assert.equal(requested.filter(({ url }) => url.endsWith('/expired.jpg')).length, 2);
    assert.equal(requested.filter(({ url }) => url.endsWith('/direct.jpg')).length, 1);
    await panel.locator('#languageSelect').selectOption('en');
    await panel.waitForFunction(() => {
      const image = document.querySelector('.user-item:first-child img');
      return image?.src.startsWith('data:image/jpeg;') && image.complete && image.naturalWidth > 0 && getComputedStyle(image).opacity === '1';
    });
    assert.equal(requested.filter(({ url, origin }) => url.endsWith('/avatar.jpg') && origin === 'https://www.instagram.com').length, 1);
    assert.deepEqual(await worker.evaluate(async () => (await chrome.storage.local.get('scanResult:100'))['scanResult:100']), snapshot);
    const report = path.join(root, '.impeccable/review');
    await fs.mkdir(report, { recursive: true });
    await panel.locator('#languageSelect').selectOption('fr');
    await panel.waitForFunction(() => getComputedStyle(document.querySelector('.user-item:first-child .user-avatar-fallback')).opacity === '0');
    await panel.evaluate(() => scrollTo(0, 0));
    await panel.screenshot({ path: path.join(report, 'profile-photos-fixture.png'), fullPage: true });
    console.log('PASS: Instagram-only and direct photos are visible; expired/missing/untrusted images keep initials; image cache and saved scan preserved; no live or API requests.');
  } finally {
    await context.close();
    await fs.rm(profile, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
