const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const load = () => import(pathToFileURL(path.join(__dirname, "../functions/index.js")).href);
const visit = (onRequest, language, url = "https://unfollow.yadulink.com/") =>
  onRequest({ request: new Request(url, { headers: language ? { "Accept-Language": language } : {} }) });

test("root home redirect follows Accept-Language, English by default", async () => {
  const { onRequest } = await load();
  for (const [language, expected] of [
    ["fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7", "/fr/"],
    ["en-US,en;q=0.9,fr;q=0.8", "/en/"],
    ["de-DE,de;q=0.9", "/en/"],
    ["de-DE,de;q=0.9,fr;q=0.7,en;q=0.5", "/fr/"],
    ["fr;q=0", "/en/"],
    [null, "/en/"],
  ]) {
    const response = visit(onRequest, language);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Location"), expected, String(language));
    assert.equal(response.headers.get("Vary"), "Accept-Language");
  }
});

test("root home redirect keeps campaign parameters", async () => {
  const { onRequest } = await load();
  const response = visit(onRequest, "fr", "https://unfollow.yadulink.com/?utm_source=newsletter");
  assert.equal(response.headers.get("Location"), "/fr/?utm_source=newsletter");
});
