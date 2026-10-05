/** Global side panel. Instagram's tab owns the scan; the worker owns persistence. */
class UnfollowTrackerPopup {
  constructor() {
    this.elements = Object.fromEntries(
      [
        "statusBar",
        "followersCount",
        "followingCount",
        "unfollowersCount",
        "scanBtn",
        "progressSection",
        "progressFill",
        "progressText",
        "resultsSection",
        "resultsList",
        "exportBtn",
        "themeToggle",
        "scanDetails",
        "scanDisclosure",
        "languageSelect",
        "connectSection",
        "openInstagramBtn",
        "searchInput",
        "showMoreBtn",
        "clearDataBtn",
        "privacyLink",
        "confirmDialog",
        "dialogTitle",
        "dialogBody",
        "dialogCancel",
        "dialogConfirm",
      ].map((id) => [id, document.getElementById(id)]),
    );
    this.elements.statusIndicator = document.querySelector(".status-indicator");
    this.elements.statusText = document.querySelector(".status-text");
    this.isScanning = false;
    this.isConnected = false;
    this.tabId = null;
    this.accountId = null;
    this.scanId = null;
    this.snapshot = null;
    this.results = [];
    this.language = "en";
    this.visibleCount = 50;
    this.syncQueue = Promise.resolve();
    this.ready = this.init();
  }

  t(key) {
    return globalThis.TrackerI18n[this.language][key] || key;
  }

  async init() {
    const e = this.elements;
    e.scanBtn.addEventListener("click", () => this.startScan());
    e.exportBtn.addEventListener("click", () => this.exportResults());
    e.themeToggle.addEventListener("click", () => this.toggleTheme());
    e.openInstagramBtn.addEventListener("click", () => this.openInstagram());
    e.clearDataBtn.addEventListener("click", () => this.clearSavedData());
    e.searchInput.addEventListener("input", () => {
      this.visibleCount = 50;
      this.showResults(this.results);
    });
    e.showMoreBtn.addEventListener("click", () => {
      this.visibleCount += 50;
      this.showResults(this.results);
    });
    e.languageSelect.addEventListener("change", async () => {
      this.language = e.languageSelect.value === "fr" ? "fr" : "en";
      this.translate();
      await chrome.storage.local.set({ language: this.language });
      await this.requestSync();
    });
    const { theme, language } = await chrome.storage.local.get([
      "theme",
      "language",
    ]);
    this.language =
      language || (chrome.i18n.getUILanguage().startsWith("fr") ? "fr" : "en");
    if (!["fr", "en"].includes(this.language)) this.language = "en";
    document.body.setAttribute(
      "data-theme",
      theme === "light" ? "light" : "dark",
    );
    this.translate();
    this.windowId = (await chrome.windows.getCurrent()).id;
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.tab?.id === this.tabId && message.accountId === this.accountId)
        this.handleMessage(message);
    });
    chrome.tabs.onActivated.addListener(({ windowId }) => {
      if (windowId === this.windowId) this.requestSync();
    });
    chrome.tabs.onCreated.addListener((tab) => {
      if (tab.windowId === this.windowId) this.requestSync();
    });
    chrome.tabs.onRemoved.addListener((id) => {
      if (id !== this.tabId) return;
      this.tabId = null;
      this.disconnect("disconnected");
      this.requestSync();
    });
    chrome.tabs.onUpdated.addListener((id, change, tab) => {
      if (tab.windowId !== this.windowId) return;
      if (id === this.tabId && change.status === "loading")
        this.disconnect("loading");
      if (change.status === "complete" || change.url) this.requestSync();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (!this.accountId) return;
      const state = changes[`scanState:${this.accountId}`]?.newValue;
      if (
        area === "session" &&
        state?.tabId === this.tabId &&
        state.status === "error"
      )
        this.showError(state.error);
      if (
        area === "local" &&
        changes[`scanResult:${this.accountId}`] &&
        !changes[`scanResult:${this.accountId}`].newValue
      )
        this.clearResults();
    });
    window.addEventListener("focus", () => this.requestSync());
    // This reads only the local content-script state, never an Instagram endpoint.
    this.timer = setInterval(() => this.requestSync(), 15000);
    window.addEventListener("unload", () => clearInterval(this.timer), {
      once: true,
    });
    await this.requestSync();
    document.body.dataset.ready = "true";
  }

  translate() {
    document.documentElement.lang = this.language;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    for (const option of this.elements.languageSelect.options)
      option.selected = option.value === this.language;
    this.elements.languageSelect.setAttribute("aria-label", this.t("language"));
    this.elements.themeToggle.setAttribute("aria-label", this.t("theme"));
    this.elements.searchInput.placeholder = this.t("search");
    this.elements.searchInput.setAttribute("aria-label", this.t("searchLabel"));
    this.elements.privacyLink.href =
      this.language === "fr" ? "privacy.html" : "privacy-en.html";
    if (this.snapshot) this.applyResults(this.snapshot);
    this.resetScanButton(this.isScanning);
    this.setStatus("offline", this.t("connecting"));
  }

  requestSync() {
    this.syncQueue = this.syncQueue
      .then(() => this.connect())
      .catch(() => this.disconnect("connectionFailed", true));
    return this.syncQueue;
  }

  async connect() {
    const tabs = (
      await chrome.tabs.query({
        windowId: this.windowId,
        url: "https://www.instagram.com/*",
      })
    ).filter((tab) => {
      try {
        return new URL(tab.url).origin === "https://www.instagram.com";
      } catch {
        return false;
      }
    });
    let tab =
      tabs.find((item) => item.id === this.tabId) ||
      tabs.find((item) => item.active) ||
      tabs[0];
    if (!tab) {
      this.tabId = null;
      this.disconnect("offline");
      return;
    }
    this.tabId = tab.id;
    if (tab.status === "loading") {
      this.disconnect("loading");
      return;
    }
    let status;
    try {
      status = await chrome.tabs.sendMessage(tab.id, { action: "getStatus" });
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/scripts/content.js"],
      });
      status = await chrome.tabs.sendMessage(tab.id, { action: "getStatus" });
    }
    if (!status?.ok || status.panelProtocol !== 3) {
      this.disconnect("reloadNeeded", true);
      return;
    }
    if (this.accountId !== status.accountId) {
      this.clearResults();
      this.accountId = status.accountId;
      this.scanId = null;
      if (this.elements.confirmDialog.open)
        this.elements.confirmDialog.close("cancel");
    }
    if (!this.accountId) {
      this.disconnect("signedOut");
      return;
    }
    const stateKey = `scanState:${this.accountId}`;
    const owner = (await chrome.storage.session.get(stateKey))[stateKey];
    // Reopening from another Instagram tab must restore the tab that owns a live scan.
    if (owner?.status === "scanning" && owner.tabId !== tab.id) {
      const ownerTab = tabs.find((candidate) => candidate.id === owner.tabId);
      if (ownerTab) {
        try {
          const active = await chrome.tabs.sendMessage(ownerTab.id, { action: "getStatus" });
          if (active?.accountId === this.accountId && active.isScanning && active.scanId === owner.scanId) {
            tab = ownerTab;
            this.tabId = ownerTab.id;
          }
        } catch { /* A stale owner is handled as an interrupted scan below. */ }
      }
    }
    this.isConnected = true;
    this.needsReload = false;
    this.elements.connectSection.classList.add("hidden");
    await this.loadCachedData();
    // Storage can yield while the account changes or a scan finishes.
    status = await chrome.tabs.sendMessage(tab.id, { action: "getStatus" });
    if (status.accountId !== this.accountId) {
      this.clearResults();
      this.accountId = null;
      this.disconnect("changed");
      return;
    }
    this.scanId = status.scanId;
    if (status.isScanning) {
      this.showScanning();
      this.updateProgress(status.progress);
      return;
    }
    await this.loadCachedData();
    const key = `scanState:${this.accountId}`;
    const state = (await chrome.storage.session.get(key))[key];
    this.resetScanButton();
    if (status.error) this.showError(status.error);
    else if (state?.status === "error") this.showError(state.error);
    else if (state?.status === "scanning") {
      if (state.tabId !== this.tabId && !tabs.some((candidate) => candidate.id === state.tabId)) {
        this.showError("A scan is already running in another Instagram tab. Wait for it to finish.");
      } else this.showError(this.t("interrupted"), true);
    }
    else this.setStatus("online", this.t("connected"));
  }

  disconnect(key, needsReload = false) {
    this.isConnected = false;
    this.needsReload = needsReload;
    this.resetScanButton();
    this.elements.connectSection.classList.remove("hidden");
    this.elements.openInstagramBtn.textContent = this.t(
      needsReload
        ? "reloadInstagram"
        : this.tabId
          ? "returnInstagram"
          : "openInstagram",
    );
    this.setStatus("offline", this.t(key));
    if (this.snapshot) this.showResults(this.results);
  }

  async openInstagram() {
    this.elements.openInstagramBtn.disabled = true;
    try {
      if (this.tabId) {
        await chrome.tabs.update(this.tabId, { active: true });
        if (this.needsReload) await chrome.tabs.reload(this.tabId);
      } else {
        const tab = await chrome.tabs.create({
          url: "https://www.instagram.com/",
          windowId: this.windowId,
          active: true,
        });
        this.tabId = tab.id;
      }
      await this.requestSync();
    } catch {
      this.tabId = null;
      this.disconnect("connectionFailed");
    } finally {
      this.elements.openInstagramBtn.disabled = false;
    }
  }

  toggleTheme() {
    const theme =
      document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", theme);
    chrome.storage.local.set({ theme }).catch(() => {});
  }

  async loadCachedData() {
    const key = `scanResult:${this.accountId}`;
    const data = (await chrome.storage.local.get(key))[key];
    if (data?.complete && data.accountId === this.accountId)
      this.applyResults(data);
    else if (this.snapshot) this.clearResults();
  }

  clearResults() {
    this.snapshot = null;
    this.results = [];
    this.visibleCount = 50;
    this.renderedKey = null;
    this.elements.scanDisclosure.classList.remove("hidden");
    this.elements.searchInput.value = "";
    this.elements.resultsList.replaceChildren();
    for (const name of ["followersCount", "followingCount", "unfollowersCount"])
      this.elements[name].textContent = "--";
    this.elements.resultsSection.classList.add("hidden");
    this.elements.scanDetails.classList.add("hidden");
  }

  showScanning() {
    this.isScanning = true;
    this.elements.clearDataBtn.disabled = true;
    this.setStatus("scanning", this.t("scanningStatus"));
    this.elements.scanBtn.disabled = true;
    this.elements.scanBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${this.t("scanning")}</span>`;
    this.elements.progressSection.classList.remove("hidden");
    this.elements.resultsSection.classList.add("hidden");
  }

  async startScan() {
    if (this.isScanning || !this.isConnected || this.isUnfollowing) return;
    await this.requestSync();
    if (this.isScanning || !this.isConnected) return;
    this.scanId = null;
    this.showScanning();
    this.elements.progressFill.style.transform = "scaleX(0)";
    this.elements.progressText.textContent = this.t("starting");
    try {
      const response = await chrome.tabs.sendMessage(this.tabId, {
        action: "startScan",
        accountId: this.accountId,
      });
      if (!response?.ok)
        throw new Error(response?.error || this.t("connectionFailed"));
      this.scanId = response.scanId;
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleMessage(message) {
    if (!["scanProgress", "scanComplete", "scanError"].includes(message.type))
      return;
    if (this.scanId && message.scanId !== this.scanId) return;
    this.scanId = message.scanId;
    if (message.type === "scanProgress") {
      this.showScanning();
      this.updateProgress(message.data);
    } else if (message.type === "scanComplete") {
      this.applyResults(message.data);
      this.resetScanButton();
      this.setStatus("online", this.t("complete"));
    } else this.showError(message.error);
  }

  updateProgress(data) {
    if (!data) return;
    this.elements.progressFill.style.transform = `scaleX(${Math.max(0, Math.min(99, data.percentage || 0)) / 100})`;
    const phases = {
      "Starting scan": "starting",
      "Fetching following": "fetchFollowing",
      "Fetching followers": "fetchFollowers",
      "Comparing lists": "comparing",
    };
    const phase = this.t(phases[data.phase] || "scanning");
    this.elements.progressText.textContent = data.retryInSeconds
      ? `${phase}: ${this.t("retry").replace("{seconds}", data.retryInSeconds)}`
      : `${phase}: ${data.current}${data.total == null ? "" : ` / ${data.total}`}`;
  }

  applyResults(data) {
    if (!data.complete || data.accountId !== this.accountId) return;
    this.snapshot = data;
    this.elements.scanDisclosure.classList.add("hidden");
    this.results = data.unfollowers;
    this.elements.followersCount.textContent = this.formatNumber(
      data.followers.length,
    );
    this.elements.followingCount.textContent = this.formatNumber(
      data.following.length,
    );
    this.elements.unfollowersCount.textContent = this.formatNumber(
      data.unfollowers.length,
    );
    this.elements.scanDetails.textContent = `${this.t("lastScan")}: ${new Date(data.lastScan).toLocaleString(this.language)}`;
    this.elements.scanDetails.classList.remove("hidden");
    this.elements.exportBtn.disabled = data.unfollowers.length === 0;
    if (!this.isScanning) this.showResults(data.unfollowers);
  }

  showResults(unfollowers) {
    this.elements.resultsSection.classList.remove("hidden");
    const query = this.elements.searchInput.value
      .trim()
      .toLocaleLowerCase(this.language);
    // Reconciliation must not remove a keyboard-focused result every 15 seconds.
    const key = [
      this.snapshot?.scanId,
      this.snapshot?.lastScan,
      unfollowers.length,
      query,
      this.visibleCount,
      this.language,
      this.isConnected,
      this.tabId,
      this.isScanning,
      this.isUnfollowing,
    ].join("|");
    if (this.renderedKey === key) return;
    this.renderedKey = key;
    this.elements.resultsList.replaceChildren();
    const users = unfollowers.filter((user) =>
      `${user.username} ${user.full_name}`
        .toLocaleLowerCase(this.language)
        .includes(query),
    );
    this.elements.showMoreBtn.classList.toggle(
      "hidden",
      users.length <= this.visibleCount,
    );
    if (!users.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = this.t(unfollowers.length ? "noMatches" : "empty");
      this.elements.resultsList.appendChild(empty);
      return;
    }
    users
      .slice(0, this.visibleCount)
      .forEach((user) =>
        this.elements.resultsList.appendChild(this.createUserElement(user)),
      );
  }

  createUserElement(user) {
    const row = document.createElement("div");
    row.className = "user-item";
    row.innerHTML =
      '<a class="user-profile" target="_blank" rel="noreferrer"><span class="user-avatar-wrapper"><span class="user-avatar-fallback"></span></span><span class="user-info"><span class="user-name"></span><span class="user-handle"></span></span></a><button class="btn-unfollow"></button>';
    row.querySelector(".user-profile").href =
      `https://www.instagram.com/${encodeURIComponent(user.username)}/`;
    row.querySelector(".user-name").textContent =
      user.full_name || user.username;
    row.querySelector(".user-handle").textContent = `@${user.username}`;
    const fallback = row.querySelector(".user-avatar-fallback");
    fallback.textContent = this.getInitials(user.full_name || user.username);
    // Only Instagram/Meta image hosts; a returned URL is untrusted data.
    let avatar;
    try {
      avatar = new URL(user.profile_pic_url);
    } catch {
      /* initials remain */
    }
    if (
      avatar?.protocol === "https:" &&
      !avatar.username && !avatar.password && !avatar.port && avatar.href.length <= 4096 &&
      /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(avatar.hostname)
    ) {
      const img = document.createElement("img");
      img.className = "user-avatar";
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        img.style.opacity = "1";
        fallback.style.opacity = "0";
      };
      const tabId = this.tabId;
      const accountId = this.accountId;
      let triedInstagram = false;
      img.onerror = async () => {
        // Keep direct loading when the CDN permits it. Otherwise load the image
        // from the connected Instagram tab, which has the expected web origin.
        if (!triedInstagram && this.isConnected && row.isConnected) {
          triedInstagram = true;
          try {
            const response = await chrome.tabs.sendMessage(tabId, {
              action: "loadAvatar", accountId, url: avatar.href,
            });
            if (!row.isConnected || this.accountId !== accountId || this.tabId !== tabId) return;
            if (response?.ok && typeof response.dataUrl === "string" &&
                response.dataUrl.length <= 350000 &&
                /^data:image\/(jpeg|png|webp|avif|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(response.dataUrl)) {
              img.src = response.dataUrl;
              return;
            }
          } catch { /* Closed tab or unavailable photo: keep initials. */ }
        }
        img.remove();
        fallback.style.opacity = "1";
      };
      img.src = avatar.href;
      row.querySelector(".user-avatar-wrapper").appendChild(img);
    }
    const button = row.querySelector(".btn-unfollow");
    button.textContent = this.t("unfollow");
    button.disabled =
      !this.isConnected || this.isScanning || Boolean(this.isUnfollowing);
    button.setAttribute(
      "aria-label",
      `${this.t("unfollow")} @${user.username}`,
    );
    button.addEventListener("click", async () => {
      const accountId = this.accountId;
      const scanId = this.snapshot?.scanId;
      if (
        await this.confirm(
          this.t("unfollowTitle"),
          `@${user.username} — ${this.t("unfollowBody")}`,
          this.t("unfollow"),
        )
      ) {
        if (accountId !== this.accountId || scanId !== this.snapshot?.scanId) {
          this.showError(this.t("changed"), true);
          return;
        }
        await this.unfollowUser(user, row);
      }
    });
    return row;
  }

  getInitials(name) {
    return name
      .split(/[\s._]+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  confirm(title, body, label) {
    const e = this.elements;
    if (e.confirmDialog.open) return Promise.resolve(false);
    e.dialogTitle.textContent = title;
    e.dialogBody.textContent = body;
    e.dialogConfirm.textContent = label;
    e.confirmDialog.returnValue = "cancel";
    return new Promise((resolve) => {
      e.dialogCancel.onclick = () => e.confirmDialog.close("cancel");
      e.dialogConfirm.onclick = () => e.confirmDialog.close("confirm");
      e.confirmDialog.addEventListener(
        "close",
        () => resolve(e.confirmDialog.returnValue === "confirm"),
        { once: true },
      );
      e.confirmDialog.showModal();
      e.dialogCancel.focus();
    });
  }

  async unfollowUser(user, element) {
    if (
      !this.isConnected ||
      this.isScanning ||
      this.isUnfollowing ||
      !this.snapshot
    )
      return;
    const accountId = this.accountId;
    this.isUnfollowing = true;
    this.elements.scanBtn.disabled = true;
    this.elements.clearDataBtn.disabled = true;
    document.querySelectorAll(".btn-unfollow").forEach((button) => {
      button.disabled = true;
    });
    element.querySelector(".btn-unfollow").textContent = this.t("unfollowing");
    try {
      const response = await chrome.tabs.sendMessage(this.tabId, {
        action: "unfollow",
        accountId,
        scanId: this.snapshot.scanId,
        userId: user.id,
        username: user.username,
      });
      if (this.accountId !== accountId) return;
      if (!response?.ok)
        throw new Error(response?.error || this.t("confirmFailed"));
      this.applyResults(response.data);
      this.setStatus("online", `${this.t("unfollowed")} @${user.username}`);
    } catch (error) {
      if (this.accountId === accountId) this.showError(error.message);
    } finally {
      this.isUnfollowing = false;
      this.resetScanButton();
      if (this.snapshot) this.showResults(this.results);
    }
  }

  async clearSavedData() {
    if (this.isScanning || this.isUnfollowing) return;
    if (
      !(await this.confirm(
        this.t("clearTitle"),
        this.t("clearBody"),
        this.t("clearConfirm"),
      ))
    )
      return;
    // Other windows may own a scan: don't delete data out from under them.
    const states = await chrome.storage.session.get(null);
    if (Object.values(states).some((state) => state?.status === "scanning")) {
      this.showError("Wait for the current request or scan to finish.");
      return;
    }
    const local = await chrome.storage.local.get(null);
    await chrome.storage.local.remove(
      Object.keys(local).filter(
        (key) =>
          key.startsWith("scanResult:") ||
          [
            "unfollowers",
            "followers",
            "following",
            "lastScan",
            "username",
          ].includes(key),
      ),
    );
    await chrome.storage.session.remove(
      Object.keys(states).filter((key) => key.startsWith("scanState:")),
    );
    this.clearResults();
    this.resetScanButton();
    this.setStatus(this.isConnected ? "online" : "offline", this.t("cleared"));
  }

  exportResults() {
    if (!this.results.length) return;
    const data = {
      exportDate: new Date().toISOString(),
      lastScan: new Date(this.snapshot.lastScan).toISOString(),
      account: this.snapshot.username || this.accountId,
      unfollowersCount: this.results.length,
      unfollowers: this.results.map((user) => ({
        username: user.username,
        fullName: user.full_name,
        profileUrl: `https://www.instagram.com/${encodeURIComponent(user.username)}/`,
      })),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `unfollowers-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  setStatus(type, text) {
    this.elements.statusIndicator.className = `status-indicator ${type}`;
    this.elements.statusText.textContent = text;
  }
  resetScanButton(keepScanning = false) {
    if (keepScanning) {
      this.showScanning();
      return;
    }
    this.isScanning = false;
    this.elements.scanBtn.disabled =
      !this.isConnected || Boolean(this.isUnfollowing);
    this.elements.clearDataBtn.disabled = Boolean(this.isUnfollowing);
    this.elements.scanBtn.innerHTML = `<span>${this.t(this.snapshot ? "refresh" : "scan")}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m21 21-5-5"/><circle cx="10" cy="10" r="7"/></svg>`;
    this.elements.progressSection.classList.add("hidden");
    if (this.snapshot) this.showResults(this.results);
  }
  showError(message, translated = false) {
    this.resetScanButton();
    this.setStatus(
      "offline",
      translated
        ? message
        : globalThis.TrackerI18n.error(
            message || this.t("genericError"),
            this.language,
          ),
    );
  }
  formatNumber(num) {
    return new Intl.NumberFormat(this.language, {
      notation: num >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(num);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new UnfollowTrackerPopup();
});
