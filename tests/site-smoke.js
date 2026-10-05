/** Local build validation; never operates the user's browser or live accounts. */
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "..");

async function main() {
  const port = 4178;
  const server = spawn(process.execPath, ["scripts/serve-site.js"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Preview exited: ${code}`)));
  });
  const browser = await chromium.launch({ headless: true });
  const review = path.join(root, ".impeccable/review");
  await fs.mkdir(review, { recursive: true });
  try {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [],
      external = [];
    await context.route("**/*", (route) => {
      if (!route.request().url().startsWith(`http://127.0.0.1:${port}`)) {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    const origin = `http://127.0.0.1:${port}`;
    for (const lang of ["fr", "en"]) {
      await page.goto(`${origin}/${lang}/`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.equal(
        await page.locator("link[rel=alternate][hreflang]").count(),
        3,
      );
      assert.equal(
        await page.locator("meta[name=robots]").getAttribute("content"),
        "noindex,nofollow",
      );
      // Validate every internal page and fragment reachable from the landing.
      const links = await page
        .locator("a[href]")
        .evaluateAll((nodes) =>
          [...new Set(nodes.map((node) => node.getAttribute("href")))].filter(
            (href) => href.startsWith("/") || href.startsWith("#"),
          ),
        );
      for (const href of links) {
        const target = new URL(href, `${origin}/${lang}/`);
        const response = await context.request.get(target.href);
        assert.equal(response.status(), 200, target.href);
        if (target.hash)
          assert.ok(
            (await response.text()).includes(`id="${target.hash.slice(1)}"`),
            `Missing anchor ${target.href}`,
          );
      }
      const panelBefore = await page.locator(".demo-panel").boundingBox();
      await page.locator("#demo-tab-1").click();
      assert.equal(await page.locator("#workspace-1").isVisible(), true);
      assert.equal(await page.locator("#workspace-0").isVisible(), false);
      assert.deepEqual(
        await page.locator(".demo-panel").boundingBox(),
        panelBefore,
      );
      await page.locator("#demo-tab-1").press("ArrowRight");
      assert.equal(
        await page.locator("#demo-tab-2").getAttribute("aria-selected"),
        "true",
      );
      await page.locator("#demo-tab-2").press("Home");
      await page.locator("#demoScan").click();
      await page.waitForFunction(
        () => !document.getElementById("demoScan").disabled,
      );
      assert.equal(await page.locator("#demoCount").textContent(), "17");
      const downloadEvent = page.waitForEvent("download");
      await page.locator("[data-export]").last().click();
      const download = await downloadEvent;
      const sample = JSON.parse(
        await fs.readFile(await download.path(), "utf8"),
      );
      assert.equal(sample.demonstration, true);
      await page.locator("summary").first().click();
      assert.equal(
        await page.locator("details").first().getAttribute("open"),
        "",
      );
      await page.locator("summary").first().click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      if (lang === "fr") {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: path.join(review, "desktop.png"),
          fullPage: true,
        });
        await page.screenshot({ path: path.join(review, "desktop-hero.png") });
      }
    }
    await page.goto(`${origin}/fr/`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#menuToggle").click();
    assert.equal(await page.locator("#navigation").isVisible(), true);
    await page.locator("#menuToggle").press("Escape");
    assert.equal(
      await page.locator("#menuToggle").getAttribute("aria-expanded"),
      "false",
    );
    await page.locator("#demo-tab-1").click();
    assert.equal(await page.locator("#workspace-1").isVisible(), true);
    await page.locator("#demo-tab-0").click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: path.join(review, "mobile.png"),
      fullPage: true,
    });
    await page.screenshot({ path: path.join(review, "mobile-hero.png") });
    // The reference inspection used a 2560px user desktop; include that width.
    await page.setViewportSize({ width: 2560, height: 1325 });
    await page.screenshot({
      path: path.join(review, "user-2560.png"),
      fullPage: true,
    });
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow at ${width}`,
      );
    }
    await page.goto(`${origin}/en/guides/non-followers/`);
    assert.equal(await page.locator("h1").count(), 1);
    assert.ok(
      JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
      ).headline,
    );
    assert.equal(errors.length, 0, errors.join("\n"));
    assert.equal(external.length, 0, external.join("\n"));
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.goto(`${origin}/fr/`);
    assert.equal(await plain.locator("h1").isVisible(), true);
    assert.equal(await plain.locator(".guide-links a").count(), 3);
    console.log(
      "PASS: FR/EN, real links/anchors, keyboard tabs, persistent demonstration, scan, export, FAQ, mobile navigation, responsive widths, structured data, no external requests, HTML without JS.",
    );
    console.log(`Evidence: ${review}`);
  } finally {
    await browser.close();
    server.kill();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
