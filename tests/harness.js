const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const { parseHTML } = require('linkedom');

const root = path.resolve(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const clone = (value) => structuredClone(value);

function event() {
  const listeners = new Set();
  return {
    listeners,
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
    emit: (...args) => { for (const listener of listeners) listener(...args); },
  };
}

function deliver(listeners, message, sender) {
  return new Promise((resolve, reject) => {
    let pending = false;
    try {
      for (const listener of listeners) {
        if (listener(clone(message), sender, (reply) => resolve(clone(reply))) === true) pending = true;
      }
      if (!pending) resolve(undefined);
    } catch (error) {
      reject(error);
    }
  });
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function user(id, extra = {}) {
  return { pk: id, username: `user${id}`, full_name: `User ${id}`, ...extra };
}

function createHarness() {
  const records = { local: {}, session: {} };
  const storageChanged = event();
  const storage = { onChanged: storageChanged };
  for (const area of ['local', 'session']) {
    storage[area] = {
      get: async (keys) => {
        const selected = keys === null ? Object.keys(records[area]) : typeof keys === 'string' ? [keys] : keys;
        return clone(Object.fromEntries(selected.filter((key) => key in records[area]).map((key) => [key, records[area][key]])));
      },
      set: async (values) => {
        const changes = {};
        for (const [key, value] of Object.entries(values)) {
          changes[key] = { oldValue: records[area][key], newValue: clone(value) };
          records[area][key] = clone(value);
        }
        storageChanged.emit(changes, area);
      },
      remove: async (keys) => {
        const changes = {};
        for (const key of keys) { changes[key] = { oldValue: records[area][key] }; delete records[area][key]; }
        storageChanged.emit(changes, area);
      },
    };
  }
  const backgroundMessages = event();
  const tabs = new Map();
  const popups = new Set();
  const requests = [];
  const notifications = [];
  const onRemoved = event();
  const onUpdated = event();
  const onCreated = event();
  const onActivated = event();
  let activeTabId = 1;
  const sendToTab = (tabId, message) => {
    const tab = tabs.get(tabId);
    if (!tab?.connected) return Promise.reject(new Error('Could not establish connection. Receiving end does not exist.'));
    return deliver(tab.messages.listeners, message, {});
  };
  const baseTabs = { sendMessage: sendToTab, onRemoved, onUpdated, onCreated, onActivated };
  const background = vm.createContext({
    chrome: { runtime: { onMessage: backgroundMessages }, storage, tabs: baseTabs },
    URL, console,
  });
  vm.runInContext(source('src/scripts/background.js'), background);

  function inject(tab) {
    vm.runInContext(source('src/scripts/content.js'), tab.context);
    tab.connected = true;
    tab.scanner = tab.context.__unfollowTrackerScanner;
    tab.scanner.sleep = async (ms) => { tab.sleeps.push(ms); };
  }

  function addTab({ id = 1, accountId = '100', fetch = async () => { throw new Error('Unexpected fetch'); }, connected = true } = {}) {
    const tab = { id, accountId, windowId: 1, status: 'complete', url: 'https://www.instagram.com/', messages: event(), connected, sleeps: [] };
    const sender = { tab: { id }, frameId: 0, url: tab.url };
    const document = {
      get cookie() { return `csrftoken=test-token; ds_user_id=${tab.accountId || ''}`; },
    };
    tab.context = vm.createContext({
      chrome: {
        runtime: {
          onMessage: tab.messages,
          sendMessage: (message) => {
            notifications.push(clone(message));
            const listeners = [...backgroundMessages.listeners, ...Array.from(popups).flatMap((popup) => [...popup.messages.listeners])];
            return deliver(listeners, message, sender);
          },
        },
        storage,
      },
      document,
      sessionStorage: { getItem: () => null },
      fetch: async (url, options) => {
        requests.push({ tabId: id, url, options });
        return fetch(url, options);
      },
      crypto: { randomUUID },
      AbortController, URLSearchParams, URL, btoa, console, setTimeout, clearTimeout,
    });
    tabs.set(id, tab);
    tab.send = (message) => sendToTab(id, message);
    if (connected) inject(tab);
    return tab;
  }

  async function popup(tabId = 1) {
    activeTabId = tabId;
    const { document } = parseHTML(source('src/popup.html'));
    const surface = { document, messages: event() };
    popups.add(surface);
    const context = vm.createContext({
      chrome: {
        runtime: { onMessage: surface.messages },
        i18n: { getUILanguage: () => 'en' },
        windows: { getCurrent: async () => ({ id: 1 }) },
        storage,
        tabs: {
          ...baseTabs,
          query: async (query) => {
            return Array.from(tabs.values()).filter((tab) => tab.windowId === query.windowId)
              .map((tab) => ({ id: tab.id, url: tab.url, windowId: tab.windowId, status: tab.status, active: tab.id === activeTabId }));
          },
          create: async ({ url }) => {
            const tab = addTab({ id: Math.max(0, ...tabs.keys()) + 1 });
            tab.url = url;
            onCreated.emit(tab);
            return { id: tab.id };
          },
          update: async (id) => { activeTabId = id; return tabs.get(id); },
          reload: async (id) => { tabs.get(id).reloaded = true; },
        },
        scripting: { executeScript: async ({ target }) => { inject(tabs.get(target.tabId)); } },
      },
      document, window: { addEventListener() {} }, URL, Blob, console, setTimeout, clearTimeout,
      setInterval: () => 1, clearInterval() {},
    });
    vm.runInContext(source('src/scripts/i18n.js'), context);
    vm.runInContext(source('src/scripts/popup.js'), context);
    surface.controller = vm.runInContext('new UnfollowTrackerPopup()', context);
    surface.close = () => popups.delete(surface);
    await surface.controller.ready;
    return surface;
  }

  async function flush() {
    await vm.runInContext('updateQueue', background);
    await new Promise((resolve) => setImmediate(resolve));
    await vm.runInContext('updateQueue', background);
  }

  return { records, storage, background, requests, notifications, addTab, popup, flush, inject, onRemoved, onUpdated, onActivated, onCreated, tabs };
}

module.exports = { createHarness, json, user };
