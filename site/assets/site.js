(() => {
  const fr = document.documentElement.lang === "fr";
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
