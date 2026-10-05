const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { createHarness, json } = require("./harness");

test("manifest installs a global side panel without broad tabs or activeTab permissions", () => {
  const manifest = JSON.parse(fs.readFileSync("manifest.json"));
  assert.equal(manifest.side_panel.default_path, "src/popup.html");
  assert.equal(manifest.action.default_popup, undefined);
  assert.deepEqual(manifest.permissions.sort(), [
    "scripting",
    "sidePanel",
    "storage",
  ]);
});

test("opening the panel without Instagram offers an explicit action and makes no requests or tabs", async () => {
  const h = createHarness();
  const panel = await h.popup();
  assert.equal(h.tabs.size, 0);
  assert.equal(h.requests.length, 0);
  assert.equal(
    panel.document
      .getElementById("connectSection")
      .classList.contains("hidden"),
    false,
  );
  assert.equal(panel.document.getElementById("scanBtn").disabled, true);
  await panel.controller.openInstagram();
  assert.equal(h.tabs.size, 1);
  assert.equal(h.requests.length, 0);
  assert.equal(panel.controller.isConnected, true);
});

test("a panel opened from another website connects to the existing Instagram tab and stays attached on tab changes", async () => {
  const h = createHarness();
  h.addTab({ id: 1 });
  const other = h.addTab({ id: 2 });
  other.url = "https://example.org/";
  const panel = await h.popup(2);
  assert.equal(panel.controller.tabId, 1);
  h.onActivated.emit({ tabId: 2, windowId: 1 });
  await panel.controller.syncQueue;
  assert.equal(panel.controller.tabId, 1);
  assert.equal(panel.controller.isConnected, true);
  assert.equal(h.requests.length, 0);
});

test("closing and replacing Instagram recovers without reopening the panel", async () => {
  const h = createHarness();
  h.addTab();
  const panel = await h.popup();
  h.tabs.delete(1);
  h.onRemoved.emit(1);
  await panel.controller.syncQueue;
  assert.equal(panel.controller.isConnected, false);
  assert.equal(panel.document.getElementById("scanBtn").disabled, true);
  const next = h.addTab({ id: 3 });
  h.onCreated.emit(next);
  await panel.controller.syncQueue;
  assert.equal(panel.controller.tabId, 3);
  assert.equal(panel.controller.isConnected, true);
});

test("an account change in an open panel clears previous account data and DOM", async () => {
  const h = createHarness();
  const tab = h.addTab();
  h.records.local["scanResult:100"] = {
    accountId: "100",
    scanId: "old",
    complete: true,
    lastScan: 1,
    following: [],
    followers: [],
    unfollowers: [{ id: "2", username: "privateName" }],
  };
  const panel = await h.popup();
  assert.match(
    panel.document.getElementById("resultsList").textContent,
    /privateName/,
  );
  tab.accountId = "200";
  await panel.controller.requestSync();
  assert.equal(panel.controller.accountId, "200");
  assert.equal(panel.controller.snapshot, null);
  assert.equal(panel.document.getElementById("resultsList").textContent, "");
});

test("the panel uses French preferences and translates a blocked Instagram request", async () => {
  const h = createHarness();
  h.addTab();
  h.records.local.language = "fr";
  const panel = await h.popup();
  assert.equal(panel.document.documentElement.lang, "fr");
  assert.match(
    panel.document.getElementById("scanBtn").textContent,
    /Scanner mon compte/,
  );
  panel.controller.showError(
    "Instagram is limiting requests. Please try again later.",
  );
  assert.match(
    panel.document.querySelector(".status-text").textContent,
    /Instagram limite temporairement/,
  );
});

test("an old content script offers a reload instead of falsely reporting ready", async () => {
  const h = createHarness();
  const tab = h.addTab();
  tab.scanner.getStatus = () => ({ ok: true, accountId: "100" });
  const panel = await h.popup();
  assert.equal(panel.controller.isConnected, false);
  assert.match(
    panel.document.getElementById("openInstagramBtn").textContent,
    /Reload/,
  );
  await panel.controller.openInstagram();
  assert.equal(tab.reloaded, true);
  assert.equal(h.requests.length, 0);
});

test("Instagram tabs in a different window are not attached", async () => {
  const h = createHarness();
  const tab = h.addTab();
  tab.windowId = 2;
  const panel = await h.popup();
  assert.equal(panel.controller.tabId, null);
  assert.equal(panel.controller.isConnected, false);
});

test("search finds results beyond the first 50 rows and remote avatars are restricted to Meta hosts", async () => {
  const h = createHarness();
  h.addTab();
  h.records.local["scanResult:100"] = {
    accountId: "100",
    scanId: "x",
    complete: true,
    lastScan: 1,
    following: [],
    followers: [],
    unfollowers: Array.from({ length: 75 }, (_, id) => ({
      id: String(id),
      username: `name${id}`,
      profile_pic_url: "https://tracker.example/pixel",
    })),
  };
  const panel = await h.popup();
  assert.equal(panel.document.querySelectorAll(".user-item").length, 50);
  assert.equal(panel.document.querySelectorAll(".user-item img").length, 0);
  panel.document.getElementById("searchInput").value = "name74";
  panel.controller.showResults(panel.controller.results);
  assert.equal(panel.document.querySelectorAll(".user-item").length, 1);
  assert.match(
    panel.document.getElementById("resultsList").textContent,
    /name74/,
  );
});

test("reopening on another Instagram tab reconnects to the live scan owner", async () => {
  const h = createHarness();
  h.addTab({ id: 1 });
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const owner = h.addTab({ id: 2, fetch: async () => { await pending; return json({ users: [] }); } });
  await owner.send({ action: 'startScan', accountId: '100' });
  await h.flush();
  const panel = await h.popup(1);
  assert.equal(panel.controller.tabId, 2);
  assert.equal(panel.controller.isScanning, true);
  release();
  await owner.scanner.scanPromise;
  await h.flush();
  assert.equal(panel.controller.isScanning, false);
  assert.equal(panel.document.getElementById('unfollowersCount').textContent, '0');
});

test("periodic reconciliation preserves result DOM and its keyboard focus target", async () => {
  const h = createHarness(); h.addTab();
  h.records.local['scanResult:100'] = { accountId: '100', scanId: 'same', complete: true, lastScan: 1, following: [], followers: [], unfollowers: [{ id: '2', username: 'user2' }] };
  const panel = await h.popup();
  const before = panel.document.querySelector('.user-profile');
  await panel.controller.requestSync();
  assert.equal(panel.document.querySelector('.user-profile'), before);
});
