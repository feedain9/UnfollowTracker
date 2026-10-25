// Cloudflare Pages Function for "/" only: send each visitor to the home page in
// their preferred language. English is the default for every other language.
// _redirects and dist/site/index.html keep an English fallback if Functions are off.
export function onRequest({ request }) {
  const { search } = new URL(request.url);
  const lang = preferredLanguage(request.headers.get("Accept-Language") || "");
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${lang}/${search}`,
      Vary: "Accept-Language",
      "Cache-Control": "private, no-store",
    },
  });
}

function preferredLanguage(header) {
  let best = { lang: "en", q: 0 };
  for (const part of header.split(",")) {
    const [tag, ...params] = part.trim().toLowerCase().split(";");
    const lang = tag.split("-")[0];
    if (lang !== "fr" && lang !== "en") continue;
    const weight = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    const q = weight ? Number(weight.slice(2)) : 1;
    if (q > best.q) best = { lang, q };
  }
  return best.lang;
}
