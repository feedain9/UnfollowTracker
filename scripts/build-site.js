const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const copy = require("../site/content");
const articles = require("../site/articles");
const config = require("../site/publication.json");
const { loadPosts } = require("../site/posts");
const posts = loadPosts();
const root = path.resolve(__dirname, "..");
const out = path.join(root, "dist/site");
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
function cta(lang, className = "", label) {
  const t = copy[lang];
  return `<a class="button ${className}" href="${esc(config.storeUrl || `/${lang}/#installation`)}"${config.storeUrl ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label || (config.storeUrl ? t.primary : t.prelaunchCta)}${icon("arrow")}</a>`;
}
function header(lang, page = "") {
  const t = copy[lang];
  return `<a href="#main" class="skip-link">${t.skip}</a><header class="site-header wrap"><a href="/${lang}/" class="brand" aria-label="UnfollowTracker">${brand()}</a><nav id="navigation" aria-label="${lang === "fr" ? "Navigation principale" : "Main navigation"}">${t.nav.map((item, i) => `<a href="/${lang}/#${["extension", "fonctionnement", "confidentialite", "faq"][i]}">${item}</a>`).join("")}</nav><div class="nav-actions"><a class="language-link" lang="${t.other}" hreflang="${t.other}" href="/${t.other}/${page}" aria-label="${t.language}">${t.other.toUpperCase()}</a>${cta(lang, "button-small button-outline", config.storeUrl ? t.primary : lang === "fr" ? "Bientôt disponible" : "Coming soon")}<button id="menuToggle" class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="${t.menu}">${icon("menu")}</button></div></header>`;
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
  return `<main id="main"><section class="hero"><div class="hero-light" aria-hidden="true"></div><div class="hero-copy wrap"><h1>${t.heading}</h1><p class="hero-intro">${t.intro}</p><div class="hero-actions">${cta(lang)}<a class="text-link" href="#demo">${t.demo}${icon("arrow")}</a></div><div class="hero-trust"><span>${icon("check")}${t.free}</span><span>${icon("check")}${t.noAccount}</span><span>${icon("panel")}${t.desktop}</span></div>${!config.storeUrl ? `<p class="launch-note">${t.availableSoon}</p>` : ""}</div>${demo(lang)}</section>
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
    <section class="closing wrap"><div class="closing-ring" aria-hidden="true"></div><h2>${t.closingTitle}</h2><p>${t.closingBody}</p>${cta(lang)}<span>${t.free} · ${t.noAccount}</span></section>
    <section class="installation wrap" id="installation"><div><h2>${config.storeUrl ? t.installLiveTitle : t.installTitle}</h2><p>${config.storeUrl ? t.installLiveBody : t.installBody}</p></div><div>${config.storeUrl ? cta(lang) : ""}<a class="text-link" href="/${lang}/getting-started/">${t.installationHelp}${icon("arrow")}</a></div></section>
    <div class="sr-only" id="exportStatus" role="status"></div></main>`;
}
function privacy(lang) {
  const fr = lang === "fr";
  return fr
    ? `<h1>Confidentialité, simplement.</h1><p class="article-lead">Vos listes Instagram restent dans votre navigateur. Voici précisément ce que fait UnfollowTracker.</p><h2>Données utilisées par l’extension</h2><p>L’extension lit l’identifiant du compte connecté, les identifiants et noms des comptes de vos listes, leurs pseudonymes et les URL de leurs photos de profil. Elle utilise la session Instagram et le jeton anti-CSRF déjà présents sur instagram.com pour effectuer les requêtes demandées. Elle ne demande pas votre mot de passe et ne stocke pas de copie des cookies ou jetons d’authentification.</p><h2>Stockage et durée</h2><p>Le dernier scan complet est conservé dans le stockage local de l’extension, séparément pour chaque compte Instagram, jusqu’à son remplacement, sa suppression depuis le panneau ou la désinstallation de l’extension. L’état d’un scan en cours est conservé dans le stockage de session du navigateur. La langue et le thème sont mémorisés localement.</p><h2>Destinataires</h2><p>Les requêtes de lecture et les désabonnements confirmés sont envoyés directement à Instagram. Les photos de profil sont chargées depuis les serveurs d’images d’Instagram ou de Meta. Aucune liste n’est transmise à un serveur UnfollowTracker. Aucun service publicitaire ou analytique n’est intégré à l’extension.</p><h2>Vos choix</h2><p>Le scan ne démarre qu’à votre demande. Un désabonnement nécessite une confirmation individuelle. Vous pouvez exporter les comptes non réciproques en JSON et effacer toutes les listes enregistrées via « Effacer les scans enregistrés ». Les fichiers déjà exportés restent sur votre appareil et doivent être supprimés séparément si vous le souhaitez.</p><h2>Ce site</h2><p>Ce site ne dépose pas de cookie analytique et ne demande pas de connexion. La démonstration utilise uniquement des données fictives. Les polices et illustrations sont hébergées avec le site. L’hébergeur reçoit les informations nécessaires à la connexion, notamment l’adresse IP et les journaux de requêtes ; Leur traitement dépend de la configuration d’hébergement et de la politique de l’hébergeur ci-dessous.</p>${config.hostingPrivacyUrl ? `<p><a href="${esc(config.hostingPrivacyUrl)}">Politique de l’hébergeur : ${esc(config.hostingName)}</a></p>` : ""}<h2>Contact</h2>${contact(lang)}<p>Nous n’utilisons ni ne transférons les données obtenues via les API Chrome à des fins autres que les fonctionnalités décrites ici. Leur utilisation respecte la politique Chrome Web Store relative aux données utilisateur, y compris les exigences de « Limited Use ».</p>`
    : `<h1>Privacy, in plain language.</h1><p class="article-lead">Your Instagram lists stay in your browser. Here is exactly what UnfollowTracker does.</p><h2>Data used by the extension</h2><p>The extension reads the signed-in account ID, the IDs and names in your follower and following lists, their usernames and profile-image URLs. It uses the Instagram session and anti-CSRF token already present on instagram.com to perform the requests you initiate. It never asks for your password and does not store a copy of authentication cookies or tokens.</p><h2>Storage and retention</h2><p>The latest complete scan is stored in local extension storage, separately per Instagram account, until replaced, deleted from the panel or removed when the extension is uninstalled. In-progress scan state is kept in browser session storage. Language and theme preferences are stored locally.</p><h2>Recipients</h2><p>Read requests and confirmed unfollows go directly to Instagram. Profile photos load from Instagram or Meta image servers. No lists are sent to an UnfollowTracker server. No advertising or analytics service is included in the extension.</p><h2>Your choices</h2><p>Scanning begins only when requested. Unfollowing requires individual confirmation. You can export non-reciprocal accounts as JSON and remove all saved lists using “Delete saved scans”. Previously exported files remain on your device and must be deleted separately if you wish.</p><h2>This website</h2><p>This website sets no analytics cookies and requires no login. The demonstration only uses fictional data. Fonts and images are hosted with the site. The hosting provider receives connection information, including your IP address and request logs; Their handling depends on the hosting configuration and the provider’s policy linked below.</p>${config.hostingPrivacyUrl ? `<p><a href="${esc(config.hostingPrivacyUrl)}">Hosting policy: ${esc(config.hostingName)}</a></p>` : ""}<h2>Contact</h2>${contact(lang)}<p>We do not use or transfer data obtained through Chrome APIs for purposes other than the features described here. Its use follows the Chrome Web Store User Data Policy, including Limited Use requirements.</p>`;
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
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${production ? "index,follow" : "noindex,nofollow"}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="fr" href="${base.origin}/fr/${route}"><link rel="alternate" hreflang="en" href="${base.origin}/en/${route}"><link rel="alternate" hreflang="x-default" href="${base.origin}/fr/${route}"><meta name="theme-color" content="#fffcfa"><meta property="og:type" content="${article ? "article" : "website"}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="UnfollowTracker"><meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "en_US"}"><meta property="og:image" content="${base.origin}/assets/og-${lang}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/assets/icon32.png"><link rel="preload" href="/assets/manrope-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/${assetFiles.css}">${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>` : ""}<script defer src="/assets/${assetFiles.js}"></script></head><body>${header(lang, route)}${body}${footer(lang)}</body></html>`;
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
    const body = `<main id="main" class="article wrap"><a class="text-link article-back" href="/${lang}/blog/">${fr ? "Tous les articles" : "All articles"}</a><article><h1>${esc(entry.title)}</h1><p class="article-lead">${esc(entry.lead)}</p><p class="article-updated">${esc(config.publisherName)} · ${fr ? "Publié le" : "Published"} <time datetime="${post.publishedAt}">${displayDate(post.publishedAt, lang)}</time>${post.updatedAt !== post.publishedAt ? ` · ${fr ? "Mis à jour le" : "Updated"} <time datetime="${post.updatedAt}">${displayDate(post.updatedAt, lang)}</time>` : ""}</p>${sections}<h2>${fr ? "Pour aller plus loin" : "Further reading"}</h2><ul>${entry.related.map((link) => `<li><a href="/${lang}/${link.route}">${esc(link.label)}</a></li>`).join("")}</ul><h2>${fr ? "Sources et méthode" : "Sources and method"}</h2><p>${fr ? "Cet article est rédigé et vérifié avec l’aide d’outils d’IA à partir des sources ci-dessous. Il ne constitue pas une documentation officielle d’Instagram. Signalez une erreur à" : "This article is written and checked with AI tools using the sources below. It is not official Instagram documentation. Report an error to"} <a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a>.</p><ul>${post.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.title)}</a> — ${fr ? "consulté le" : "accessed"} ${displayDate(source.checkedAt, lang)}</li>`).join("")}</ul></article><div class="article-next">${cta(lang)}</div></main>`;
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
  const pages = [
    {
      route: "privacy/",
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
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(production ? routes.filter((url) => !url.endsWith("/legal/")) : []).map((url) => `<url><loc>${url}</loc>${lastModified.has(url) ? `<lastmod>${lastModified.get(url)}</lastmod>` : ""}</url>`).join("")}</urlset>`,
);
fs.writeFileSync(path.join(out, "_redirects"), "/ /fr/ 302\n");
fs.writeFileSync(
  path.join(out, "_headers"),
  "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'\n/assets/*\n  Cache-Control: public, max-age=3600\n",
);
console.log(
  `Built ${routes.length} localized pages in dist/site (${production ? "indexable production" : "private preview; noindex"}).`,
);
