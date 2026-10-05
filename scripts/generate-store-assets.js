/** Render authored brand layouts and real, fixture-only extension captures. */
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const review = path.join(root, ".impeccable/review");
async function main() {
  const destination = path.join(root, "docs/release/assets");
  await fs.mkdir(destination, { recursive: true });
  const font = (
    await fs.readFile(path.join(root, "assets/fonts/manrope-latin.woff2"))
  ).toString("base64");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const css = `@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400 800}*{box-sizing:border-box}body{margin:0;font-family:Manrope,sans-serif;background:#0b0b0e;color:#fff8f4}.frame{width:100vw;height:100vh;position:relative;overflow:hidden;padding:64px 72px;background:radial-gradient(ellipse at 85% 120%,#602e28,transparent 62%)}.brand{display:flex;gap:14px;align-items:center;font-size:23px;font-weight:750;letter-spacing:-.03em}.mark{width:34px;height:34px;border-radius:50%;background:conic-gradient(from 50deg,transparent 0 11%,#fdba94 16%,#f57b70 49%,#9c67bb 83%,transparent 90%);position:relative;flex:none}.mark:after{content:'';position:absolute;inset:3px;background:#0b0b0e;border-radius:50%}.mark:before{content:'';width:5px;height:5px;border-radius:50%;background:#ffac8c;position:absolute;right:1px;top:0}h1{font-size:66px;line-height:1.1;font-weight:600;letter-spacing:-.04em;margin:80px 0 24px;max-width:850px}h1 span{color:#ffb19c}p{font-size:22px;line-height:1.7;max-width:660px;color:#baaeb8;margin:0}.free{display:block;margin-top:40px;font-size:15px;color:#e8b8a9}.ring{position:absolute;width:550px;height:550px;right:-290px;top:-320px;border:1px solid #8c534640;border-radius:50%}.screen{position:absolute;right:74px;top:0;width:360px;height:800px;object-fit:contain;border-left:1px solid #59454d;border-right:1px solid #59454d}.with-screen h1{font-size:57px;width:600px;margin-top:124px}.with-screen p{max-width:580px;font-size:19px}.note{position:absolute;bottom:42px;left:72px;font-size:12px;color:#b1a2af}.promo{padding:35px 36px}.promo .brand{font-size:22px;gap:10px}.promo .mark{width:32px;height:32px}.promo h1{font-size:32px;max-width:350px;margin:36px 0 15px;letter-spacing:-.035em}.promo p{font-size:12px;color:#d9b6af}`;
    const render = async (file, width, height, html) => {
      await page.setViewportSize({ width, height });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`,
      );
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: file });
    };
    const brand =
      '<div class="brand"><span class="mark"></span>UnfollowTracker</div>';
    for (const lang of ["fr", "en"]) {
      const fr = lang === "fr";
      await render(
        path.join(root, `site/assets/og-${lang}.png`),
        1200,
        630,
        `<main class="frame"><div class="ring"></div>${brand}<h1>${fr ? "Vous les suivez.<br><span>Et en retour ?</span>" : "You follow them.<br><span>Do they follow back?</span>"}</h1><p>${fr ? "Vos abonnements Instagram, un peu plus clairs." : "Your Instagram following, a little clearer."}</p><span class="free">${fr ? "Extension gratuite · Résultats enregistrés localement" : "Free extension · Results saved locally"}</span></main>`,
      );
      const screenshot = (
        await fs.readFile(
          path.join(review, fr ? "panel-results-fr.png" : "panel-light-en.png"),
        )
      ).toString("base64");
      await render(
        path.join(destination, `screenshot-${lang}-1280x800.png`),
        1280,
        800,
        `<main class="frame with-screen"><div class="ring"></div>${brand}<h1>${fr ? "Votre liste.<br><span>Juste à côté.</span>" : "Your list.<br><span>Right beside you.</span>"}</h1><p>${fr ? "Comparez vos abonnés et abonnements dans un panneau qui reste accessible." : "Compare your followers and following in a panel that stays within reach."}</p><span class="free">${fr ? "Gratuit · Recherche · Export" : "Free · Search · Export"}</span><img class="screen" src="data:image/png;base64,${screenshot}" alt=""><span class="note">${fr ? "Capture de l’extension 1.1.0 · données de démonstration" : "Extension 1.1.0 capture · demonstration data"}</span></main>`,
      );
    }
    await render(
      path.join(destination, "promo-440x280.png"),
      440,
      280,
      `<main class="frame promo"><div class="ring"></div>${brand}<h1>Who follows<br><span>you back?</span></h1><p>Free Instagram side panel</p></main>`,
    );
    await fs.copyFile(
      path.join(root, "assets/icons/icon128.png"),
      path.join(destination, "icon128.png"),
    );
    console.log(
      "Created FR/EN 1200×630 social images, FR/EN 1280×800 store captures, 440×280 promotional image and 128px icon.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
