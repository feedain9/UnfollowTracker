const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

function build(t, ...args) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "unfollow-site-"));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  execFileSync(process.execPath, ["scripts/build-site.js", ...args], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, SITE_OUT: out },
  });
  return (file) => fs.readFileSync(path.join(out, file), "utf8");
}

test("production pages load Plausible from its own origin only", (t) => {
  const read = build(t, "--production");
  const home = read("fr/index.html");
  assert.match(
    home,
    /<html lang="fr" data-analytics="https:\/\/analytics\.krilup\.com" data-analytics-host="unfollow\.yadulink\.com" data-extension-domain="extension\.unfollow\.yadulink\.com">/,
  );
  assert.match(
    home,
    /<script async src="https:\/\/analytics\.krilup\.com\/js\/pa-[\w-]+\.js" referrerpolicy="no-referrer"><\/script>/,
  );
  const headers = read("_headers");
  assert.match(headers, /script-src 'self' https:\/\/analytics\.krilup\.com;/);
  assert.match(headers, /connect-src https:\/\/analytics\.krilup\.com;/);
});

test("welcome and uninstall pages stay out of search and record no pageview", (t) => {
  const read = build(t, "--production");
  for (const lang of ["fr", "en"]) {
    for (const route of ["welcome", "uninstalled"]) {
      const html = read(`${lang}/${route}/index.html`);
      assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
      assert.match(html, /data-pageview="off"/);
    }
    assert.match(read(`${lang}/privacy/index.html`), /<meta name="robots" content="index,follow">/);
  }
  const sitemap = read("sitemap.xml");
  assert.doesNotMatch(sitemap, /welcome|uninstalled/);
  assert.match(sitemap, /\/en\/privacy\/<\/loc><lastmod>/);
});

test("previews never load or contact Plausible", (t) => {
  const read = build(t);
  assert.doesNotMatch(read("fr/index.html"), /analytics\.krilup\.com|data-analytics/);
  assert.match(read("_headers"), /script-src 'self';.*connect-src 'none';/);
});
