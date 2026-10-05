/* eslint-env node */
const fs = require("node:fs");
const path = require("node:path");

const languages = ["fr", "en"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value) {
  return typeof value === "string" && datePattern.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function text(value, label, max = 12000) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error(`Invalid ${label}.`);
}
function currentDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
}
function validatePost(post, filename) {
  if (post.schemaVersion !== 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || "") ||
      filename !== `${post.slug}.json`) throw new Error(`Invalid post filename or schema: ${filename}`);
  if (!["draft", "published"].includes(post.status)) throw new Error(`Invalid status: ${filename}`);
  text(post.intent, "search intent", 300);
  if (!validDate(post.publishedAt) || !validDate(post.updatedAt) || post.updatedAt < post.publishedAt)
    throw new Error(`Invalid dates: ${filename}`);
  if (!Array.isArray(post.sources) || !post.sources.length) throw new Error(`Sources required: ${filename}`);
  for (const source of post.sources) {
    text(source.title, "source title", 300);
    const url = new URL(source.url);
    if (url.protocol !== "https:" || url.username || url.password || !validDate(source.checkedAt) || source.checkedAt > post.updatedAt)
      throw new Error(`Invalid source: ${filename}`);
  }
  for (const lang of languages) {
    const entry = post[lang];
    if (!entry) throw new Error(`Missing ${lang} translation: ${filename}`);
    text(entry.title, "title", 110);
    text(entry.description, "description", 180);
    text(entry.lead, "lead", 1000);
    if (!Array.isArray(entry.sections) || entry.sections.length < 2) throw new Error(`Incomplete article: ${filename}`);
    for (const section of entry.sections) {
      text(section.heading, "section heading", 160);
      if (!Array.isArray(section.paragraphs) || !section.paragraphs.length) throw new Error(`Missing section body: ${filename}`);
      for (const paragraph of section.paragraphs) text(paragraph, "paragraph");
      for (const kind of ["steps", "bullets"]) {
        if (section[kind] !== undefined && !Array.isArray(section[kind])) throw new Error(`Invalid ${kind}: ${filename}`);
        for (const item of section[kind] || []) text(item, kind);
      }
      for (const source of section.sources || []) {
        if (!Number.isInteger(source) || source < 1 || source > post.sources.length) throw new Error(`Invalid source reference: ${filename}`);
      }
    }
    if (!Array.isArray(entry.related) || !entry.related.length) throw new Error(`Missing internal links: ${filename}`);
    for (const link of entry.related) {
      text(link.label, "related link", 160);
      if (!/^(?:guides\/[a-z0-9-]+|blog\/[a-z0-9-]+|getting-started|privacy)\/$/.test(link.route))
        throw new Error(`Invalid related route: ${filename}`);
    }
  }
  return post;
}
function loadPosts(directory = path.join(__dirname, "posts"), today = currentDay()) {
  if (!validDate(today)) throw new Error("Invalid build date.");
  const all = fs.readdirSync(directory).filter((file) => file.endsWith(".json")).map((file) =>
    validatePost(JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")), file));
  for (const field of ["intent", "fr.title", "en.title"]) {
    const seen = new Set();
    for (const post of all) {
      const value = field.split(".").reduce((obj, key) => obj[key], post).trim().toLowerCase();
      if (seen.has(value)) throw new Error(`Duplicate ${field}: ${value}`);
      seen.add(value);
    }
  }
  return all.filter((post) => post.status === "published" && post.publishedAt <= today && post.updatedAt <= today)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}
module.exports = { loadPosts, validatePost, currentDay };
