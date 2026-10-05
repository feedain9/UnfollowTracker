const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadPosts, validatePost } = require("../site/posts");

function fixture(slug = "example") {
  const entry = {
    title: "Example article", description: "A useful answer.", lead: "What this guide explains.",
    sections: [{ heading: "First", paragraphs: ["Explanation"], sources: [1] }, { heading: "Second", paragraphs: ["Details"] }],
    related: [{ label: "Guide", route: "guides/non-followers/" }],
  };
  return { schemaVersion: 1, slug, intent: slug, status: "published", publishedAt: "2026-10-05", updatedAt: "2026-10-05",
    sources: [{ url: "https://example.com/reference", title: "Reference", checkedAt: "2026-10-05" }],
    fr: structuredClone(entry), en: structuredClone(entry) };
}
function directory(t, posts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "unfollow-posts-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const post of posts) fs.writeFileSync(path.join(dir, `${post.slug}.json`), JSON.stringify(post));
  return dir;
}
test("daily posts require both languages and valid source references", () => {
  const post = fixture();
  delete post.en;
  assert.throws(() => validatePost(post, "example.json"), /translation/);
  post.en = structuredClone(post.fr);
  post.fr.sections[0].sources = [2];
  assert.throws(() => validatePost(post, "example.json"), /source reference/);
});
test("draft and future content never enters the public build", (t) => {
  const draft = fixture("draft"); draft.status = "draft";
  const future = fixture("future"); future.publishedAt = future.updatedAt = "2026-10-06";
  for (const post of [draft, future]) for (const lang of ["fr", "en"]) post[lang].title = post.slug;
  const dir = directory(t, [fixture(), draft, future]);
  assert.deepEqual(loadPosts(dir, "2026-10-05").map((post) => post.slug), ["example"]);
});
test("invalid dates, unsafe links and missing bodies fail publication", () => {
  const post = fixture();
  post.publishedAt = "2026-02-30";
  assert.throws(() => validatePost(post, "example.json"), /dates/);
  post.publishedAt = "2026-10-05";
  post.sources[0].url = "javascript:alert(1)";
  assert.throws(() => validatePost(post, "example.json"), /source/);
  post.sources[0].url = "https://example.com";
  post.fr.related[0].route = "../../private/";
  assert.throws(() => validatePost(post, "example.json"), /route/);
});
test("repeating an existing search intent fails the build", (t) => {
  const duplicate = fixture("duplicate"); duplicate.intent = " EXAMPLE ";
  const dir = directory(t, [fixture(), duplicate]);
  assert.throws(() => loadPosts(dir, "2026-10-05"), /Duplicate intent/);
});
