(() => {
  const fr = document.documentElement.lang === "fr";
  // Production pages carry the Plausible settings; previews and other hosts send nothing.
  const tracking = document.documentElement.dataset;
  const measured =
    Boolean(tracking.analytics) && location.hostname === tracking.analyticsHost;
  if (measured) {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
    window.plausible.init =
      window.plausible.init ||
      function (options) {
        window.plausible.o = options;
      };
    window.plausible.init({
      autoCapturePageviews: tracking.pageview !== "off",
      outboundLinks: false,
      fileDownloads: false,
      formSubmissions: false,
      transformRequest(payload) {
        if (payload.n !== "pageview" && payload.n !== "Install Click")
          return null;
        try {
          const url = new URL(payload.u);
          const clean = new URL(url.origin + url.pathname);
          // Only campaign labels are kept; other query values never leave the page.
          for (const name of ["utm_source", "utm_medium", "utm_campaign"]) {
            const value = url.searchParams.get(name);
            if (value && /^[\w.-]{1,80}$/.test(value))
              clean.searchParams.set(name, value);
          }
          let referrer = null;
          if (payload.r) {
            const source = new URL(payload.r);
            if (/^https?:$/.test(source.protocol))
              referrer = `${source.origin}/`;
          }
          const placement =
            payload.n === "Install Click" && payload.p?.placement;
          return {
            n: payload.n,
            v: payload.v,
            d: payload.d,
            u: clean.href,
            r: referrer,
            ...(placement ? { p: { placement } } : {}),
          };
        } catch {
          return null;
        }
      },
    });
  }
  function trackInstall(event) {
    if (!measured || (event.type === "auxclick" && event.button !== 1)) return;
    const link = event.target.closest?.("a[data-install]");
    if (!link) return;
    try {
      window.plausible("Install Click", {
        props: { placement: link.dataset.install },
      });
    } catch {
      // Measurement must never prevent opening the store.
    }
  }
  document.addEventListener("click", trackInstall);
  document.addEventListener("auxclick", trackInstall);
  // Install and uninstall belong to the extension's statistics site.
  function sendExtensionEvent(name, props) {
    if (!measured || navigator.webdriver) return;
    fetch(`${tracking.analytics}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        name,
        domain: tracking.extensionDomain,
        url: `app://unfollowtracker/${name.toLowerCase().replace(/ /g, "-")}`,
        props,
      }),
      keepalive: true,
      credentials: "omit",
      referrerPolicy: "no-referrer",
    }).catch(() => {});
  }
  // The extension's uninstall link carries anonymous counters, validated here.
  function uninstallDetails(query) {
    const version = query.get("v") || "";
    if (query.get("o") === "1" || !/^\d+(\.\d+){1,3}$/.test(version))
      return null;
    const pick = (name, allowed) =>
      allowed.includes(query.get(name)) ? query.get(name) : "unknown";
    const day = query.get("i") || "";
    const days = /^\d{4}-\d{2}-\d{2}$/.test(day)
      ? (Date.now() - Date.parse(`${day}T00:00:00Z`)) / 86400000
      : NaN;
    const age =
      !Number.isFinite(days) || days < 0
        ? "unknown"
        : days < 1
          ? "0d"
          : days < 7
            ? "1-6d"
            : days < 30
              ? "7-29d"
              : days < 90
                ? "30-89d"
                : "90d+";
    return {
      version,
      browser: pick("b", ["brave", "edge", "opera", "chrome", "chromium", "other"]),
      age,
      scans: pick("s", ["0", "1", "2-5", "6-20", "21+"]),
      last: pick("x", ["none", "complete", "error"]),
    };
  }
  const survey = document.querySelector("[data-uninstall-survey]");
  if (survey) {
    const details = uninstallDetails(new URLSearchParams(location.search));
    // Counters never stay in the address bar, the history or a reload.
    if (location.search) history.replaceState(null, "", location.pathname);
    if (details) sendExtensionEvent("Uninstall", details);
    survey.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-reason]");
      if (!choice || survey.dataset.answered) return;
      survey.dataset.answered = "true";
      for (const option of survey.querySelectorAll("[data-reason]")) {
        option.setAttribute("aria-pressed", String(option === choice));
        option.disabled = true;
      }
      sendExtensionEvent("Uninstall Reason", {
        reason: choice.dataset.reason,
        ...details,
      });
      survey.querySelector("[data-survey-status]").textContent = fr
        ? "Merci, c’est noté."
        : "Thank you, noted.";
    });
  }
  const menu = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");
  function closeMenu() {
    navigation.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
  }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  });
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu?.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menu.focus();
    }
  });
  const tabs = [...document.querySelectorAll("[data-tab]")];
  function selectTab(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(`workspace-${i}`).hidden = i !== index;
    });
    document.getElementById("demoAddress").textContent = [
      "instagram.com/alex.martin",
      fr ? "Mes notes" : "My notes",
      fr ? "Nouvel onglet" : "New tab",
    ][index];
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      selectTab(next, true);
    });
  });
  document.getElementById("tryTabs")?.addEventListener("click", () => {
    selectTab(1);
    tabs[1].focus({ preventScroll: true });
  });
  const scan = document.getElementById("demoScan");
  scan?.addEventListener("click", async () => {
    if (scan.disabled) return;
    scan.disabled = true;
    const label = scan.querySelector("span");
    const status = document.getElementById("demoStatus");
    const stages = fr
      ? [
          "Lecture des abonnements…",
          "Lecture des abonnés…",
          "Comparaison des listes…",
        ]
      : ["Reading following…", "Reading followers…", "Comparing lists…"];
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("demoCount").textContent = "—";
    for (const stage of stages) {
      label.textContent = stage;
      status.textContent = stage;
      if (!reduced) await new Promise((resolve) => setTimeout(resolve, 650));
    }
    document.getElementById("demoCount").textContent = "17";
    status.innerHTML = `<span></span>${fr ? "Scan terminé · démonstration" : "Scan complete · demonstration"}`;
    label.textContent = fr ? "Rejouer le scan" : "Replay the scan";
    scan.disabled = false;
  });
  document.querySelectorAll("[data-export]").forEach((button) =>
    button.addEventListener("click", () => {
      const data = {
        demonstration: true,
        notice: fr
          ? "Données fictives. Cet exemple n’est pas un scan Instagram."
          : "Fictional data. This example is not an Instagram scan.",
        accounts: [
          { username: "lea.morel", fullName: "Léa Morel" },
          { username: "studio.atlas", fullName: "Studio Atlas" },
          { username: "noah.laurent", fullName: "Noah Laurent" },
        ],
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "unfollowtracker-demo.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const status = document.getElementById("exportStatus");
      if (status)
        status.textContent = fr
          ? "Exemple JSON téléchargé."
          : "Sample JSON downloaded.";
    }),
  );
})();
