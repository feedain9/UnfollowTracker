// Notifies IndexNow engines (Bing, Yandex, Seznam, Naver…) of public URLs that changed.
// Run after the deployment is live: node scripts/indexnow.js <url>… | --sitemap
const config = require("../site/publication.json");

async function main() {
  const base = new URL(config.siteUrl);
  if (!config.indexNowKey) throw new Error("Add indexNowKey to site/publication.json.");
  let urls = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (!urls.length) {
    if (!process.argv.includes("--sitemap")) throw new Error("Pass URLs or --sitemap.");
    const sitemap = await (await fetch(`${base.origin}/sitemap.xml`)).text();
    urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  }
  for (const url of urls)
    if (new URL(url).host !== base.host) throw new Error(`Not a page of ${base.host}: ${url}`);
  const keyLocation = `${base.origin}/${config.indexNowKey}.txt`;
  const proof = await fetch(keyLocation);
  if (!proof.ok || (await proof.text()).trim() !== config.indexNowKey)
    throw new Error(`The key file is not live at ${keyLocation}; deploy first.`);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: base.host, key: config.indexNowKey, keyLocation, urlList: urls }),
  });
  console.log(`IndexNow answered HTTP ${response.status} for ${urls.length} URL(s).`);
  // 200 and 202 mean received; anything else is reported, never retried in a loop.
  if (response.status !== 200 && response.status !== 202) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
