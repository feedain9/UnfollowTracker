const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const copy = require("../site/content");
const articles = require("../site/articles");
const config = require("../site/publication.json");
const { loadPosts } = require("../site/posts");
const posts = loadPosts();
const root = path.resolve(__dirname, "..");
// SITE_OUT lets tests build elsewhere without replacing the preview output.
const out = path.resolve(root, process.env.SITE_OUT || "dist/site");
const assetFiles = Object.fromEntries(["css", "js"].map((extension) => {
  const content = fs.readFileSync(path.join(root, `site/assets/site.${extension}`));
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  return [extension, `site.${hash}.${extension}`];
}));
const production = process.argv.includes("--production");
const base = new URL(config.siteUrl);
if (
  base.protocol !== "https:" ||
  base.pathname !== "/" ||
  base.search ||
  base.hash
)
  throw new Error("siteUrl must be an HTTPS origin.");
if (
  config.storeUrl &&
  !/^https:\/\/chromewebstore\.google\.com\/detail\/[a-z0-9/-]+$/.test(
    config.storeUrl,
  )
)
  throw new Error("Configure a real Chrome Web Store detail URL.");
if (production) {
  const missing = [
    "publisherName",
    "supportEmail",
    "publisherAddress",
    "hostingName",
    "hostingPrivacyUrl",
  ].filter((key) => !config[key]);
  if (missing.length)
    throw new Error(
      `Complete site/publication.json before publishing: ${missing.join(", ")}`,
    );
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail))
    throw new Error("Invalid public support email.");
}
const analyticsScript = config.analyticsScript
  ? new URL(config.analyticsScript)
  : null;
if (
  analyticsScript &&
  (analyticsScript.protocol !== "https:" ||
    !/^\/js\/pa-[\w-]+\.js$/.test(analyticsScript.pathname) ||
    !/^[a-z0-9.-]+$/.test(config.analyticsExtensionDomain || ""))
)
  throw new Error(
    "analyticsScript must be a Plausible pa-*.js HTTPS URL, with analyticsExtensionDomain.",
  );
// Previews and local tests never load Plausible or send events.
const analytics = production ? analyticsScript : null;
// Opened by the extension itself: never indexed, no pageview of their own.
const utilityRoutes = new Set(["welcome/", "uninstalled/"]);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name, className = "") => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    down: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    panel:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a20 20 0 0 1 0 18 20 20 0 0 1 0-18Z"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    refresh:
      '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
  };
  return `<svg class="${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const brand = () =>
  '<span class="brand-mark" aria-hidden="true"></span><span>UnfollowTracker</span>';
function cta(lang, { className = "", label, placement, route = "" } = {}) {
  const t = copy[lang];
  // The store dashboard breaks listing visits down by these UTM parameters.
  const store = config.storeUrl && new URL(config.storeUrl);
  if (store) {
    store.searchParams.set("utm_source", base.host);
    store.searchParams.set("utm_medium", "website");
    store.searchParams.set(
      "utm_campaign",
      `${lang}-${route.replace(/\/$/, "").replace(/\//g, "-") || "home"}`,
    );
  }
  return `<a class="button ${className}" href="${esc(store ? store.href : `/${lang}/#installation`)}"${store ? ` target="_blank" rel="noopener noreferrer" data-install="${placement}"` : ""}>${label || (store ? t.primary : t.prelaunchCta)}${icon("arrow")}</a>`;
}
function header(lang, page = "") {
  const t = copy[lang];
  return `<a href="#main" class="skip-link">${t.skip}</a><header class="site-header wrap"><a href="/${lang}/" class="brand" aria-label="UnfollowTracker">${brand()}</a><nav id="navigation" aria-label="${lang === "fr" ? "Navigation principale" : "Main navigation"}">${t.nav.map((item, i) => `<a href="/${lang}/#${["extension", "fonctionnement", "confidentialite", "faq"][i]}">${item}</a>`).join("")}</nav><div class="nav-actions"><a class="language-link" lang="${t.other}" hreflang="${t.other}" href="/${t.other}/${page}" aria-label="${t.language}">${t.other.toUpperCase()}</a>${page === "welcome/" ? "" : cta(lang, { className: "button-small button-outline", label: config.storeUrl ? t.primary : lang === "fr" ? "Bientôt disponible" : "Coming soon", placement: "header", route: page })}<button id="menuToggle" class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="${t.menu}">${icon("menu")}</button></div></header>`;
}
function footer(lang) {
  const t = copy[lang];
  return `<footer class="site-footer wrap"><div class="footer-top"><div><a class="brand" href="/${lang}/">${brand()}</a><p>${t.footerTagline}</p></div><div class="footer-column"><h2>${t.footerProduct}</h2><a href="/${lang}/#extension">${t.nav[0]}</a><a href="/${lang}/#fonctionnement">${t.nav[1]}</a><a href="/${lang}/#installation">${lang === "fr" ? "Installation" : "Installation"}</a></div><div class="footer-column"><h2>${t.footerResources}</h2><a href="/${lang}/blog/">Blog Instagram</a><a href="/${lang}/getting-started/">${t.guide}</a><a href="/${lang}/guides/non-followers/">${lang === "fr" ? "Comprendre les résultats" : "Understand your results"}</a><a href="/${lang}/guides/scan-troubleshooting/">${lang === "fr" ? "Résoudre un blocage" : "Troubleshoot a scan"}</a></div><div class="footer-column"><h2>${t.footerLegal}</h2><a href="/${lang}/privacy/">${t.privacy}</a><a href="/${lang}/legal/">${t.legal}</a>${config.supportEmail ? `<a href="mailto:${esc(config.supportEmail)}">Contact</a>` : ""}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} UnfollowTracker</span><span>${t.unaffiliated}</span></div></footer>`;
}
const names = [
  ["Léa Morel", "lea.morel", "LM"],
  ["Studio Atlas", "studio.atlas", "SA"],
  ["Noah Laurent", "noah.laurent", "NL"],
];
function rows(lang, compact = false) {
  return names
    .map(
      ([name, handle, initials], i) =>
        `<div class="demo-row"><span class="avatar avatar-${i}">${initials}</span><span class="demo-user"><b>${name}</b><small>@${handle}</small></span>${compact ? `<span class="mini-label">${copy[lang].compareResult}</span>` : `<span class="demo-unfollow">${lang === "fr" ? "Ne plus suivre" : "Unfollow"}</span>`}</div>`,
    )
    .join("");
}
function demo(lang) {
  const t = copy[lang];
  return `<div class="demo-wrap wrap" id="demo"><div class="demo-caption"><p>${icon("panel")}${t.demoLabel}</p><span>${t.synthetic}</span></div><div class="browser-demo"><div class="browser-toolbar"><div class="traffic-lights" aria-hidden="true"><i></i><i></i><i></i></div><div class="demo-tabs" role="tablist" aria-label="${lang === "fr" ? "Onglets de la démonstration" : "Demonstration tabs"}">${t.tabs.map((name, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="workspace-${i}" id="demo-tab-${i}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}">${i === 0 ? '<span class="ig-mini" aria-hidden="true"></span>' : icon(i === 1 ? "panel" : "plus")}${name}</button>`).join("")}</div><span class="browser-extension-icon" aria-hidden="true">${brand()}</span></div><div class="browser-address"><span>${icon("lock")}<span id="demoAddress">instagram.com/alex.martin</span></span>${icon("panel")}</div><div class="browser-content"><div class="demo-workspace"><div class="instagram-workspace" id="workspace-0" role="tabpanel" aria-labelledby="demo-tab-0"><aside class="ig-sidebar" aria-hidden="true"><span class="ig-word">Instagram</span>${["panel", "search", "plus", "globe"].map((name) => icon(name)).join("")}<span class="avatar profile-mini">AM</span></aside><div class="ig-profile"><div class="profile-head"><div class="profile-avatar"><span>AM</span></div><div><strong>alex.martin</strong><div class="profile-counts"><span><b>24</b> ${t.posts}</span><span><b>231</b> ${t.followers}</span><span><b>248</b> ${t.following}</span></div><p><b>${t.profileName}</b><br>${t.bio}</p></div></div><div class="profile-posts"><img src="/assets/mountains.jpg" alt="${lang === "fr" ? "Montagnes au bord d’un lac" : "Mountains beside a lake"}" width="640" height="640"><img src="/assets/coast.jpg" alt="${lang === "fr" ? "Vagues dans l’océan" : "Ocean waves"}" width="640" height="640"><img src="/assets/forest.jpg" alt="${lang === "fr" ? "Lumière dans une forêt" : "Sunlight in a forest"}" width="640" height="640"></div><div class="profile-under"><span>${t.profileName}</span><p>${lang === "fr" ? "Prendre le temps de regarder autour de soi." : "Taking time to look around."}</p></div></div></div><div id="workspace-1" role="tabpanel" aria-labelledby="demo-tab-1" class="notes-workspace" hidden><span class="notes-date">05 / 10 / 2026</span><h3>${t.notesTitle}</h3><p>${t.notesBody}</p><ul>${t.notesItems.map((item) => `<li>${icon("check")}${item}</li>`).join("")}</ul></div><div id="workspace-2" role="tabpanel" aria-labelledby="demo-tab-2" class="new-workspace" hidden><span class="new-tab-orbit" aria-hidden="true">${icon("globe")}</span><h3>${t.newTabTitle}</h3><p>${t.newTabBody}</p></div></div><aside class="demo-panel" aria-label="${lang === "fr" ? "Démonstration du panneau UnfollowTracker" : "UnfollowTracker panel demonstration"}"><div class="demo-panel-header"><div class="brand">${brand()}</div>${icon("panel")}</div><p class="demo-status" id="demoStatus" role="status"><span></span>${t.demoStatus}</p><div class="demo-stats"><div><b>231</b><span>${t.followers}</span></div><div><b>248</b><span>${t.following}</span></div><div><b id="demoCount">17</b><span>${lang === "fr" ? "pas en retour" : "don’t follow back"}</span></div></div><button class="button demo-scan" id="demoScan">${icon("refresh")}<span>${t.refresh}</span></button><p class="demo-timestamp">${t.scanDate}</p><div class="demo-list-head"><h3>${t.nonreciprocal}</h3><button class="demo-export" data-export>${icon("down")}<span class="sr-only">${t.export}</span></button></div><div id="demoRows">${rows(lang)}</div><p class="demo-rest">${lang === "fr" ? "+ 14 autres comptes dans cet exemple" : "+ 14 more accounts in this example"}</p></aside></div></div></div>`;
}
function landing(lang) {
  const t = copy[lang];
  return `<main id="main"><section class="hero"><div class="hero-light" aria-hidden="true"></div><div class="hero-copy wrap"><h1>${t.heading}</h1><p class="hero-intro">${t.intro}</p><div class="hero-actions">${cta(lang, { placement: "hero" })}<a class="text-link" href="#demo">${t.demo}${icon("arrow")}</a></div><div class="hero-trust"><span>${icon("check")}${t.free}</span><span>${icon("check")}${t.noAccount}</span><span>${icon("panel")}${t.desktop}</span></div>${!config.storeUrl ? `<p class="launch-note">${t.availableSoon}</p>` : ""}</div>${demo(lang)}</section>
    <section class="features wrap section" id="extension"><div class="section-heading"><h2>${t.featureHeading}</h2><p>${t.featureIntro}</p></div><article class="feature feature-compare"><div class="feature-copy"><span class="feature-icon" aria-hidden="true">${icon("search")}</span><h3>${t.f1Title}</h3><p>${t.f1Body}</p><p class="feature-note">${icon("check")}${t.f1Note}</p></div><div class="compare-demo" aria-label="${t.synthetic}"><div class="compare-labels"><span>${t.compareFollowing}</span><span>${t.compareFollowers}</span></div>${[
      ["lea.morel", false],
      ["camille.jpg", true],
      ["studio.atlas", false],
      ["louise.explore", true],
    ]
      .map(
        ([name, mutual], i) =>
          `<div class="compare-row ${mutual ? "mutual" : "nonmutual"}"><span><i class="avatar avatar-${i % 3}">${name.slice(0, 2).toUpperCase()}</i><b>@${name}</b></span><span>${mutual ? icon("check") : `<i class="missing-dash" aria-label="${t.compareResult}"></i>`}</span></div>`,
      )
      .join(
        "",
      )}<p>${icon("check")}${lang === "fr" ? "La différence apparaît clairement." : "The difference becomes clear."}</p></div></article>
    <article class="feature feature-persist"><div class="feature-copy"><span class="feature-icon" aria-hidden="true">${icon("panel")}</span><h3>${t.f2Title}</h3><p>${t.f2Body}</p><p class="feature-note">${t.f2Note}</p><a class="text-link" href="#demo" id="tryTabs">${t.f2Action}${icon("arrow")}</a></div><div class="persistence-art" aria-hidden="true"><div class="mini-window window-back"><div class="mini-window-bar"><span></span><span></span><span></span></div><p>Instagram</p><div class="mini-photo"><img src="/assets/coast.jpg" alt="" width="640" height="640" loading="lazy"></div></div><div class="mini-window window-front"><div class="mini-window-bar"><span></span><span></span><span></span></div><div class="mini-notes"><h4>${t.tabs[1]}</h4><p>${t.notesItems[0]}</p><p>${t.notesItems[1]}</p></div><div class="mini-panel"><span class="brand-mark"></span><b>17</b><small>${lang === "fr" ? "pas en retour" : "don’t follow back"}</small><div class="tiny-row"></div><div class="tiny-row"></div><div class="tiny-row"></div></div></div><span class="persistent-note">${icon("check")}${lang === "fr" ? "Toujours à vos côtés" : "Still by your side"}</span></div></article>
    <article class="feature feature-export"><div class="feature-copy"><span class="feature-icon" aria-hidden="true">${icon("down")}</span><h3>${t.f3Title}</h3><p>${t.f3Body}</p><p class="feature-note">${t.f3Note}</p></div><div class="export-art"><div class="export-heading"><span class="brand-mark"></span><b>${t.nonreciprocal}</b></div>${rows(lang, true)}<button class="button button-outline" data-export>${icon("down")}<span>${t.exportDemo}</span></button><p class="artifact-caption">${t.synthetic}</p></div></article></section>
    <section class="how-section wrap section" id="fonctionnement"><div class="section-heading"><h2>${t.howTitle}</h2></div><ol class="steps">${t.steps.map(([title, body]) => `<li><h3>${title}</h3><p>${body}</p></li>`).join("")}</ol></section>
    <section class="privacy-section section" id="confidentialite"><div class="privacy-inner wrap"><div><span class="privacy-symbol" aria-hidden="true">${icon("lock")}</span><h2>${t.privacyTitle}</h2><p>${t.privacyBody}</p><a class="text-link" href="/${lang}/privacy/">${t.privacyLink}${icon("arrow")}</a></div><dl>${t.privacyPoints.map(([title, body]) => `<div><dt>${icon("check")}${title}</dt><dd>${body}</dd></div>`).join("")}</dl></div></section>
    <section class="faq-section wrap section" id="faq"><h2>${t.faqTitle}</h2><div class="faq-list">${t.faq.map(([q, a]) => `<details><summary>${q}${icon("plus")}</summary><p>${a}</p></details>`).join("")}</div></section>
    <section class="guides-section wrap section"><div class="guides-heading"><h2>${t.guidesTitle}</h2><p>${t.guidesIntro}</p></div><div class="guide-links">${t.guideTitles.map((title, i) => `<a href="/${lang}/guides/${["non-followers", "unfollowers-vs-non-followers", "scan-troubleshooting"][i]}/"><div><h3>${title}</h3><p>${t.guideDescriptions[i]}</p></div>${icon("arrow")}</a>`).join("")}</div></section>
    <section class="closing wrap"><div class="closing-ring" aria-hidden="true"></div><h2>${t.closingTitle}</h2><p>${t.closingBody}</p>${cta(lang, { placement: "closing" })}<span>${t.free} · ${t.noAccount}</span></section>
    <section class="installation wrap" id="installation"><div><h2>${config.storeUrl ? t.installLiveTitle : t.installTitle}</h2><p>${config.storeUrl ? t.installLiveBody : t.installBody}</p></div><div>${config.storeUrl ? cta(lang, { placement: "installation" }) : ""}<a class="text-link" href="/${lang}/getting-started/">${t.installationHelp}${icon("arrow")}</a></div></section>
    <div class="sr-only" id="exportStatus" role="status"></div></main>`;
}
function privacy(lang) {
  const fr = lang === "fr";
  const hosting = config.hostingPrivacyUrl
    ? `<p><a href="${esc(config.hostingPrivacyUrl)}">${fr ? "Politique de l’hébergeur :" : "Hosting policy:"} ${esc(config.hostingName)}</a></p>`
    : "";
  return fr
    ? `<h1>Confidentialité, simplement.</h1><p class="article-lead">Vos listes Instagram restent dans votre navigateur. Voici précisément ce que fait UnfollowTracker, et les seules statistiques anonymes que nous recevons.</p><h2>Données utilisées par l’extension</h2><p>L’extension lit l’identifiant du compte connecté, les identifiants et noms des comptes de vos listes, leurs pseudonymes et les URL de leurs photos de profil. Elle utilise la session Instagram et le jeton anti-CSRF déjà présents sur instagram.com pour effectuer les requêtes demandées. Elle ne demande pas votre mot de passe et ne stocke pas de copie des cookies ou jetons d’authentification.</p><h2>Stockage et durée</h2><p>Le dernier scan complet est conservé dans le stockage local de l’extension, séparément pour chaque compte Instagram, jusqu’à son remplacement, sa suppression depuis le panneau ou la désinstallation de l’extension. L’état d’un scan en cours est conservé dans le stockage de session du navigateur. La langue, le thème et votre choix concernant les statistiques sont mémorisés localement, ainsi que quelques compteurs d’usage : date d’installation, nombre de scans terminés et de comptes enregistrés, issue du dernier scan et dernier jour d’utilisation.</p><h2>Statistiques d’usage anonymes</h2><p>Depuis la version 1.2.0, l’extension installée depuis le Chrome Web Store envoie des statistiques d’usage anonymes. Elles nous indiquent combien de personnes installent, utilisent et désinstallent l’extension, et quels scans échouent, afin de l’améliorer. Les événements mesurés sont l’installation, la mise à jour, l’ouverture du panneau (au plus une fois par jour), le début, la fin ou l’échec d’un scan, l’export, un désabonnement confirmé et la suppression des scans.</p><p>Chaque événement contient uniquement la version de l’extension, le navigateur, la langue de l’interface, une catégorie d’erreur et des tranches de valeurs, par exemple « 300 à 999 abonnés », « 10 à 49 comptes non réciproques » ou « 1 à 6 jours depuis l’installation ». Il ne contient jamais l’identifiant ni le pseudonyme de votre compte Instagram, vos listes, les noms ou photos des comptes, vos cookies ou jetons, ni l’adresse des pages que vous consultez. Aucun identifiant propre à votre navigateur ou à votre installation n’est créé.</p><p>Ces statistiques sont envoyées à notre instance de Plausible Analytics, un outil de mesure d’audience sans cookie, hébergée chez Hetzner Online en Allemagne. À la réception, votre adresse IP sert uniquement à déduire votre pays et à calculer un identifiant anonyme renouvelé chaque jour ; Plausible ne la conserve pas. Nous ne consultons que des résultats agrégés.</p><p>Vous pouvez désactiver ces statistiques à tout moment en décochant « Partager des statistiques d’usage anonymes » en bas du panneau. Une version chargée hors du Chrome Web Store n’envoie aucune statistique.</p><h2>Pages d’installation et de désinstallation</h2><p>Après l’installation, l’extension ouvre une page de bienvenue sur ce site. Après une désinstallation, votre navigateur ouvre une page qui propose un court sondage facultatif. L’adresse de cette page indique la version, le navigateur, la date d’installation, la tranche du nombre de scans et l’issue du dernier scan ; la page convertit la date en tranche avant d’envoyer ces informations à nos statistiques, puis les retire de la barre d’adresse. Votre réponse au sondage n’est envoyée que si vous choisissez une raison. Si vous aviez désactivé les statistiques, l’adresse ne contient aucune de ces informations et rien n’est envoyé automatiquement.</p><h2>Destinataires</h2><p>Les requêtes de lecture et les désabonnements confirmés sont envoyés directement à Instagram. Les photos de profil sont chargées depuis les serveurs d’images d’Instagram ou de Meta. Aucune liste n’est transmise à un serveur UnfollowTracker : l’éditeur ne reçoit que les statistiques anonymes décrites ci-dessus. Aucun service publicitaire n’est intégré à l’extension.</p><h2>Vos choix</h2><p>Le scan ne démarre qu’à votre demande. Un désabonnement nécessite une confirmation individuelle. Vous pouvez exporter les comptes non réciproques en JSON, effacer toutes les listes enregistrées via « Effacer les scans enregistrés » et désactiver les statistiques d’usage depuis le panneau. Les fichiers déjà exportés restent sur votre appareil et doivent être supprimés séparément si vous le souhaitez.</p><h2>Ce site</h2><p>Ce site ne dépose aucun cookie et ne demande pas de connexion. Il mesure son audience avec la même instance de Plausible Analytics : pages consultées, site d’origine, paramètres de campagne, pays, type d’appareil et de navigateur, temps de lecture, défilement et clics sur les boutons d’installation. L’adresse de la page est enregistrée sans ses autres paramètres, et le site d’origine sans le chemin de sa page. Aucun identifiant persistant n’est utilisé. La démonstration utilise uniquement des données fictives. Les polices et illustrations sont hébergées avec le site. L’hébergeur reçoit les informations nécessaires à la connexion, notamment l’adresse IP et les journaux de requêtes ; leur traitement dépend de la configuration d’hébergement et de la politique de l’hébergeur ci-dessous.</p>${hosting}<h2>Base légale</h2><p>Ces mesures d’audience reposent sur notre intérêt légitime à comprendre l’usage de l’extension et du site pour les améliorer. Elles se limitent à des statistiques anonymes, ne servent ni à la publicité ni au profilage et ne sont ni vendues ni partagées. Vous pouvez vous opposer à celles de l’extension depuis le panneau, et à celles du site en bloquant les scripts de mesure d’audience dans votre navigateur.</p><h2>Contact</h2>${contact(lang)}<p>Nous n’utilisons ni ne transférons les données obtenues via les API Chrome à des fins autres que les fonctionnalités décrites ici. Leur utilisation respecte la politique Chrome Web Store relative aux données utilisateur, y compris les exigences de « Limited Use ».</p>`
    : `<h1>Privacy, in plain language.</h1><p class="article-lead">Your Instagram lists stay in your browser. Here is exactly what UnfollowTracker does, and the only anonymous statistics we receive.</p><h2>Data used by the extension</h2><p>The extension reads the signed-in account ID, the IDs and names in your follower and following lists, their usernames and profile-image URLs. It uses the Instagram session and anti-CSRF token already present on instagram.com to perform the requests you initiate. It never asks for your password and does not store a copy of authentication cookies or tokens.</p><h2>Storage and retention</h2><p>The latest complete scan is stored in local extension storage, separately per Instagram account, until replaced, deleted from the panel or removed when the extension is uninstalled. In-progress scan state is kept in browser session storage. Language, theme and your statistics choice are stored locally, along with a few usage counters: install date, number of completed scans and saved accounts, outcome of the last scan and last day of use.</p><h2>Anonymous usage statistics</h2><p>Since version 1.2.0, the extension installed from the Chrome Web Store sends anonymous usage statistics. They tell us how many people install, use and uninstall the extension, and which scans fail, so we can improve it. The measured events are install, update, opening the panel (at most once a day), a scan starting, completing or failing, export, a confirmed unfollow and deleting saved scans.</p><p>Each event only contains the extension version, browser, interface language, an error category and value ranges such as “300–999 followers”, “10–49 non-reciprocal accounts” or “1–6 days since install”. It never contains your Instagram account ID or username, your lists, account names or photos, your cookies or tokens, or the address of pages you visit. No identifier tied to your browser or installation is created.</p><p>These statistics go to our own Plausible Analytics instance, a cookieless audience measurement tool hosted by Hetzner Online in Germany. On receipt, your IP address is only used to derive your country and compute an anonymous identifier that changes every day; Plausible does not keep it. We only look at aggregated results.</p><p>You can turn these statistics off at any time by unchecking “Share anonymous usage statistics” at the bottom of the panel. A version loaded outside the Chrome Web Store sends no statistics.</p><h2>Install and uninstall pages</h2><p>After installation, the extension opens a welcome page on this website. After an uninstall, your browser opens a page offering a short, optional survey. Its address includes the version, browser, install date, range of completed scans and outcome of the last scan; the page converts the date into a range before sending this information to our statistics, then removes it from the address bar. Your survey answer is only sent if you choose a reason. If you had turned statistics off, the address contains none of this information and nothing is sent automatically.</p><h2>Recipients</h2><p>Read requests and confirmed unfollows go directly to Instagram. Profile photos load from Instagram or Meta image servers. No lists are sent to an UnfollowTracker server: the publisher only receives the anonymous statistics described above. No advertising service is included in the extension.</p><h2>Your choices</h2><p>Scanning begins only when requested. Unfollowing requires individual confirmation. You can export non-reciprocal accounts as JSON, remove all saved lists using “Delete saved scans” and turn usage statistics off in the panel. Previously exported files remain on your device and must be deleted separately if you wish.</p><h2>This website</h2><p>This website sets no cookies and requires no login. It measures its audience with the same Plausible Analytics instance: pages viewed, referring site, campaign parameters, country, device type and browser, reading time, scrolling and clicks on install buttons. Page addresses are recorded without other parameters, and referring sites without their page path. No persistent identifier is used. The demonstration only uses fictional data. Fonts and images are hosted with the site. The hosting provider receives connection information, including your IP address and request logs; their handling depends on the hosting configuration and the provider’s policy linked below.</p>${hosting}<h2>Legal basis</h2><p>This audience measurement relies on our legitimate interest in understanding how the extension and website are used in order to improve them. It is limited to anonymous statistics, is never used for advertising or profiling, and is neither sold nor shared. You can object to the extension’s statistics in the panel, and to the website’s by blocking audience measurement scripts in your browser.</p><h2>Contact</h2>${contact(lang)}<p>We do not use or transfer data obtained through Chrome APIs for purposes other than the features described here. Its use follows the Chrome Web Store User Data Policy, including Limited Use requirements.</p>`;
}
function contact(lang) {
  return config.supportEmail
    ? `<p>${esc(config.publisherName)} · <a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a></p>`
    : `<p>${lang === "fr" ? "Les coordonnées publiques de l’éditeur seront ajoutées avant la publication de l’extension." : "The publisher’s public contact details will be added before the extension is published."}</p>`;
}
function legal(lang) {
  const fr = lang === "fr";
  return `<h1>${copy[lang].legal}</h1><h2>${fr ? "Éditeur" : "Publisher"}</h2>${contact(lang)}${config.publisherRegistration ? `<p>${esc(config.publisherRegistration)}</p>` : ""}${config.publisherAddress ? `<p>${esc(config.publisherAddress)}</p>` : ""}<h2>${fr ? "Hébergement" : "Hosting"}</h2><p>${config.hostingName ? esc(config.hostingName) : fr ? "Le site est en préparation. Les informations sur son hébergeur seront ajoutées avant sa mise en ligne publique." : "The site is being prepared. Hosting details will be provided before public launch."}</p><h2>${fr ? "Indépendance et disponibilité" : "Independence and availability"}</h2><p>${copy[lang].unaffiliated} ${fr ? "Instagram peut modifier ou limiter l’accès à ses services. UnfollowTracker ne garantit pas une disponibilité permanente ni l’absence de restrictions de compte." : "Instagram may change or limit access to its services. UnfollowTracker does not guarantee continuous availability or freedom from account restrictions."}</p><h2>${fr ? "Crédits" : "Credits"}</h2><p>Manrope — <a href="https://github.com/google/fonts/tree/main/ofl/manrope">SIL Open Font License</a>. ${fr ? "Photographies de démonstration" : "Demonstration photography"} — <a href="https://unsplash.com/license">Unsplash</a>.</p>`;
}
function welcome(lang) {
  const fr = lang === "fr";
  const steps = fr
    ? [
        ["Épinglez l’extension", "Cliquez sur l’icône en forme de pièce de puzzle, à droite de la barre d’adresse, puis sur l’épingle à côté d’UnfollowTracker. Son icône reste alors visible."],
        ["Connectez-vous à Instagram", "Ouvrez instagram.com dans ce navigateur et connectez-vous directement sur le site. L’extension ne vous demande jamais votre mot de passe."],
        ["Lancez votre scan", "Cliquez sur l’icône UnfollowTracker : le panneau s’ouvre à côté de la page. Choisissez « Scanner mon compte » et gardez l’onglet Instagram ouvert pendant la lecture de vos listes."],
      ]
    : [
        ["Pin the extension", "Click the puzzle-piece icon to the right of the address bar, then the pin next to UnfollowTracker. Its icon then stays visible."],
        ["Sign in to Instagram", "Open instagram.com in this browser and sign in directly on the website. The extension never asks for your password."],
        ["Run your scan", "Click the UnfollowTracker icon: the panel opens beside the page. Choose “Scan my account” and keep the Instagram tab open while your lists are read."],
      ];
  return `<main id="main" class="article wrap"><h1>${fr ? "UnfollowTracker est installé." : "UnfollowTracker is installed."}</h1><p class="article-lead">${fr ? "Encore trois gestes, et votre première liste est prête." : "Three more steps and your first list is ready."}</p><ol class="welcome-steps">${steps.map(([title, body]) => `<li><h2>${title}</h2><p>${body}</p></li>`).join("")}</ol><p class="welcome-action"><a class="button" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">${fr ? "Ouvrir Instagram" : "Open Instagram"}${icon("arrow")}</a></p><h2>${fr ? "Vos données" : "Your data"}</h2><p>${fr ? "Vos listes restent dans votre navigateur. Pour nous aider à améliorer l’extension, elle envoie des statistiques d’usage anonymes, sans aucune donnée Instagram. Vous pouvez les désactiver à tout moment en bas du panneau." : "Your lists stay in your browser. To help us improve it, the extension sends anonymous usage statistics, without any Instagram data. You can turn them off at any time at the bottom of the panel."}</p><p><a href="/${lang}/privacy/">${fr ? "Lire la politique de confidentialité" : "Read the privacy policy"}</a> · <a href="/${lang}/getting-started/">${fr ? "Guide d’utilisation complet" : "Full getting started guide"}</a></p></main>`;
}
// Codes are the only survey values sent; labels stay on the page.
const uninstallReasons = {
  fr: [
    ["scan_failed", "Le scan n’a pas abouti"],
    ["instagram_limit", "Instagram a limité les requêtes ou demandé une vérification"],
    ["too_slow", "Le scan était trop long"],
    ["wanted_history", "Je voulais savoir qui s’est désabonné"],
    ["done", "J’ai obtenu ma liste, je n’en ai plus besoin"],
    ["privacy", "Je m’inquiétais pour mon compte ou mes données"],
    ["other", "Une autre raison"],
  ],
  en: [
    ["scan_failed", "The scan didn’t complete"],
    ["instagram_limit", "Instagram limited requests or asked for verification"],
    ["too_slow", "Scanning took too long"],
    ["wanted_history", "I wanted to know who unfollowed me"],
    ["done", "I got my list and no longer need it"],
    ["privacy", "I was worried about my account or data"],
    ["other", "Another reason"],
  ],
};
function uninstalled(lang) {
  const fr = lang === "fr";
  return `<main id="main" class="article wrap"><h1>${fr ? "UnfollowTracker a été désinstallé." : "UnfollowTracker has been uninstalled."}</h1><p class="article-lead">${fr ? "Les scans enregistrés par l’extension ont été supprimés avec elle. Les fichiers que vous avez exportés restent sur votre appareil." : "The scans saved by the extension were removed with it. Files you exported remain on your device."}</p><section class="survey" aria-labelledby="surveyTitle" data-uninstall-survey><h2 id="surveyTitle">${fr ? "Pourquoi l’avez-vous désinstallé\u00a0?" : "Why did you uninstall it?"}</h2><p>${fr ? "Une réponse anonyme, en un clic. Elle nous aide à choisir quoi améliorer." : "One anonymous click. It helps us decide what to improve."}</p><div class="survey-options">${uninstallReasons[lang].map(([code, label]) => `<button type="button" class="survey-option" data-reason="${code}" aria-pressed="false">${label}</button>`).join("")}</div><p class="survey-status" role="status" data-survey-status></p><p>${fr ? "Pour nous en dire plus\u00a0:" : "To tell us more:"} <a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a></p></section><h2>${fr ? "Changé d’avis\u00a0?" : "Changed your mind?"}</h2><p>${fr ? "UnfollowTracker reste gratuit. Vous pouvez le réinstaller à tout moment depuis le Chrome Web Store." : "UnfollowTracker stays free. You can reinstall it from the Chrome Web Store at any time."}</p>${config.storeUrl ? `<div class="article-next">${cta(lang, { label: fr ? "Réinstaller gratuitement" : "Reinstall for free", placement: "uninstalled", route: "uninstalled/" })}</div>` : ""}</main>`;
}
const routes = [];
const lastModified = new Map();
function documentPage(lang, route, title, description, body, article = false, post = null) {
  const url = `${base.origin}/${lang}/${route}`;
  const t = copy[lang];
  const schema = article
    ? {
        "@context": "https://schema.org",
        "@type": post ? "BlogPosting" : "Article",
        headline: title,
        inLanguage: lang,
        dateModified: post ? post.updatedAt : "2026-10-05",
        ...(post ? { datePublished: post.publishedAt, image: `${base.origin}/assets/og-${lang}.png` } : {}),
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: config.publisherName, url: `${base.origin}/${lang}/legal/` },
      }
    : route
      ? null
      : {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "UnfollowTracker",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Desktop Chrome 116+, compatible Chromium browsers",
          description: t.description,
          inLanguage: ["fr", "en"],
          url,
          ...(config.storeUrl
            ? {
                downloadUrl: config.storeUrl,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "EUR",
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        };
  const utility = utilityRoutes.has(route);
  const tracking = analytics
    ? ` data-analytics="${analytics.origin}" data-analytics-host="${base.host}" data-extension-domain="${esc(config.analyticsExtensionDomain)}"${utility ? ' data-pageview="off"' : ""}`
    : "";
  const html = `<!doctype html><html lang="${lang}"${tracking}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${production && !utility ? "index,follow" : "noindex,nofollow"}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="fr" href="${base.origin}/fr/${route}"><link rel="alternate" hreflang="en" href="${base.origin}/en/${route}"><link rel="alternate" hreflang="x-default" href="${base.origin}/fr/${route}"><meta name="theme-color" content="#fffcfa"><meta property="og:type" content="${article ? "article" : "website"}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="UnfollowTracker"><meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "en_US"}"><meta property="og:image" content="${base.origin}/assets/og-${lang}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/assets/icon32.png"><link rel="preload" href="/assets/manrope-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/${assetFiles.css}">${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>` : ""}<script defer src="/assets/${assetFiles.js}"></script>${analytics ? `<script async src="${analytics.href}" referrerpolicy="no-referrer"></script>` : ""}</head><body>${header(lang, route)}${body}${footer(lang)}</body></html>`;
  const dest = path.join(out, lang, route);
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, "index.html"), html);
  routes.push(url);
  if (post) lastModified.set(url, post.updatedAt);
}
function displayDate(value, lang) {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}
function blogPages(lang) {
  const fr = lang === "fr";
  const size = 12;
  const count = Math.max(1, Math.ceil(posts.length / size));
  for (let page = 1; page <= count; page++) {
    const route = page === 1 ? "blog/" : `blog/page/${page}/`;
    const title = `${fr ? "Conseils et guides Instagram" : "Instagram tips and guides"}${page > 1 ? ` · ${page}` : ""}`;
    const description = fr ? "Des réponses pratiques pour comprendre vos abonnements Instagram, lire vos résultats et utiliser UnfollowTracker." : "Practical answers to understand Instagram follows, interpret your results and use UnfollowTracker.";
    const items = posts.slice((page - 1) * size, page * size).map((post) => `<article><p class="article-updated"><time datetime="${post.publishedAt}">${displayDate(post.publishedAt, lang)}</time></p><h2><a href="/${lang}/blog/${post.slug}/">${esc(post[lang].title)}</a></h2><p>${esc(post[lang].description)}</p></article>`).join("");
    const paging = count > 1 ? `<nav aria-label="${fr ? "Pages du blog" : "Blog pages"}">${Array.from({ length: count }, (_, i) => `<a ${i + 1 === page ? 'aria-current="page" ' : ""}href="/${lang}/blog/${i ? `page/${i + 1}/` : ""}">${i + 1}</a>`).join(" · ")}</nav>` : "";
    const body = `<main id="main" class="article wrap"><a class="text-link article-back" href="/${lang}/">${copy[lang].back}</a><h1>${title}</h1><p class="article-lead">${description}</p>${items || `<p>${fr ? "Les premiers articles arrivent bientôt. En attendant, découvrez nos guides pratiques." : "The first articles are coming soon. Explore our practical guides in the meantime."}</p><p><a href="/${lang}/guides/non-followers/">${copy[lang].guideTitles[0]}</a></p>`}${paging}</main>`;
    documentPage(lang, route, `${title} | UnfollowTracker`, description, body);
  }
  for (const post of posts) {
    const entry = post[lang];
    const sections = entry.sections.map((section) => `<section><h2>${esc(section.heading)}</h2>${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}${["steps", "bullets"].map((kind) => section[kind]?.length ? `<${kind === "steps" ? "ol" : "ul"}>${section[kind].map((item) => `<li>${esc(item)}</li>`).join("")}</${kind === "steps" ? "ol" : "ul"}>` : "").join("")}${section.sources?.length ? `<p>${fr ? "Sources" : "Sources"} : ${section.sources.map((i) => `<a href="${esc(post.sources[i - 1].url)}">${esc(post.sources[i - 1].title)}</a>`).join(" · ")}</p>` : ""}</section>`).join("");
    const body = `<main id="main" class="article wrap"><a class="text-link article-back" href="/${lang}/blog/">${fr ? "Tous les articles" : "All articles"}</a><article><h1>${esc(entry.title)}</h1><p class="article-lead">${esc(entry.lead)}</p><p class="article-updated">${esc(config.publisherName)} · ${fr ? "Publié le" : "Published"} <time datetime="${post.publishedAt}">${displayDate(post.publishedAt, lang)}</time>${post.updatedAt !== post.publishedAt ? ` · ${fr ? "Mis à jour le" : "Updated"} <time datetime="${post.updatedAt}">${displayDate(post.updatedAt, lang)}</time>` : ""}</p>${sections}<h2>${fr ? "Pour aller plus loin" : "Further reading"}</h2><ul>${entry.related.map((link) => `<li><a href="/${lang}/${link.route}">${esc(link.label)}</a></li>`).join("")}</ul><h2>${fr ? "Sources et méthode" : "Sources and method"}</h2><p>${fr ? "Cet article est rédigé et vérifié avec l’aide d’outils d’IA à partir des sources ci-dessous. Il ne constitue pas une documentation officielle d’Instagram. Signalez une erreur à" : "This article is written and checked with AI tools using the sources below. It is not official Instagram documentation. Report an error to"} <a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a>.</p><ul>${post.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.title)}</a> — ${fr ? "consulté le" : "accessed"} ${displayDate(source.checkedAt, lang)}</li>`).join("")}</ul></article><div class="article-next">${cta(lang, { placement: "article", route: `blog/${post.slug}/` })}</div></main>`;
    documentPage(lang, `blog/${post.slug}/`, `${entry.title} | UnfollowTracker`, entry.description, body, true, post);
  }
}
// Remove generated output so drafts, deleted posts and old pagination cannot linger.
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, "site/assets"), path.join(out, "assets"), {
  recursive: true,
});
for (const extension of ["css", "js"]) {
  fs.copyFileSync(path.join(root, `site/assets/site.${extension}`), path.join(out, "assets", assetFiles[extension]));
}
fs.copyFileSync(
  path.join(root, "assets/fonts/manrope-latin.woff2"),
  path.join(out, "assets/manrope-latin.woff2"),
);
fs.copyFileSync(
  path.join(root, "assets/fonts/OFL.txt"),
  path.join(out, "assets/OFL.txt"),
);
fs.copyFileSync(
  path.join(root, "assets/icons/icon32.png"),
  path.join(out, "assets/icon32.png"),
);
for (const lang of ["fr", "en"]) {
  const t = copy[lang];
  documentPage(lang, "", t.title, t.description, landing(lang));
  blogPages(lang);
  documentPage(
    lang,
    "welcome/",
    lang === "fr" ? "Bienvenue | UnfollowTracker" : "Welcome | UnfollowTracker",
    lang === "fr"
      ? "Épinglez l’extension, connectez-vous à Instagram et lancez votre premier scan."
      : "Pin the extension, sign in to Instagram and run your first scan.",
    welcome(lang),
  );
  documentPage(
    lang,
    "uninstalled/",
    lang === "fr" ? "Désinstallation | UnfollowTracker" : "Uninstalled | UnfollowTracker",
    lang === "fr"
      ? "Dites-nous en un clic pourquoi vous avez désinstallé UnfollowTracker."
      : "Tell us in one click why you uninstalled UnfollowTracker.",
    uninstalled(lang),
  );
  const pages = [
    {
      route: "privacy/",
      updatedAt: "2026-10-25",
      title: t.privacy,
      description:
        lang === "fr"
          ? "Données traitées, stockage local et suppression : la confidentialité de UnfollowTracker."
          : "Data processing, local storage and deletion: UnfollowTracker privacy.",
      body: privacy(lang),
    },
    {
      route: "legal/",
      title: t.legal,
      description: t.unaffiliated,
      body: legal(lang),
    },
    ...articles[lang],
  ];
  for (const page of pages) {
    const updated = page.updatedAt
      ? `${lang === "fr" ? "Mis à jour le" : "Updated"} ${displayDate(page.updatedAt, lang)}`
      : t.updated;
    const body = `<main id="main" class="article wrap"><a class="text-link article-back" href="/${lang}/">${t.back}</a>${page.body}<p class="article-updated">${updated}</p><div class="article-next"><a class="text-link" href="/${lang}/#installation">${lang === "fr" ? "Découvrir l’extension gratuite" : "Explore the free extension"}${icon("arrow")}</a></div></main>`;
    documentPage(
      lang,
      page.route,
      `${page.title} | UnfollowTracker`,
      page.description,
      body,
      page.route.startsWith("guides/"),
    );
    if (page.updatedAt)
      lastModified.set(`${base.origin}/${lang}/${page.route}`, page.updatedAt);
  }
  // Same truthful policy bundled with the extension; no remote scripts or font imports.
  const local = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.privacy} · UnfollowTracker</title><link rel="stylesheet" href="styles/privacy.css"></head><body><nav><a href="privacy.html#fr">Français</a> · <a href="privacy-en.html">English</a></nav><main>${privacy(lang)}</main></body></html>`;
  fs.writeFileSync(
    path.join(root, `src/privacy${lang === "en" ? "-en" : ""}.html`),
    local,
  );
}
for (const post of posts) {
  for (const lang of ["fr", "en"]) {
    for (const link of post[lang].related) {
      if (!routes.includes(`${base.origin}/${lang}/${link.route}`)) throw new Error(`Broken article link: ${lang}/${link.route}`);
    }
  }
}
fs.writeFileSync(
  path.join(out, "index.html"),
  '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/fr/"><title>UnfollowTracker</title></head><body><a href="/fr/">Français</a> · <a href="/en/">English</a></body></html>',
);
fs.writeFileSync(
  path.join(out, "404.html"),
  '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable · UnfollowTracker</title><link rel="stylesheet" href="/assets/site.css"></head><body><main class="article wrap"><h1>Cette page n’existe pas.</h1><p>This page could not be found.</p><a href="/fr/">Accueil français</a> · <a href="/en/">English home</a></main></body></html>',
);
fs.writeFileSync(
  path.join(out, "robots.txt"),
  production
    ? `User-agent: *\nAllow: /\nSitemap: ${base.origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n",
);
fs.writeFileSync(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(production ? routes.filter((url) => !url.endsWith("/legal/") && !utilityRoutes.has(url.split("/").slice(4).join("/"))) : []).map((url) => `<url><loc>${url}</loc>${lastModified.has(url) ? `<lastmod>${lastModified.get(url)}</lastmod>` : ""}</url>`).join("")}</urlset>`,
);
fs.writeFileSync(path.join(out, "_redirects"), "/ /fr/ 302\n");
fs.writeFileSync(
  path.join(out, "_headers"),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'${analytics ? ` ${analytics.origin}` : ""}; style-src 'self'; img-src 'self'; font-src 'self'; connect-src ${analytics ? analytics.origin : "'none'"}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'\n/assets/*\n  Cache-Control: public, max-age=3600\n`,
);
console.log(
  `Built ${routes.length} localized pages in dist/site (${production ? "indexable production" : "private preview; noindex"}).`,
);
