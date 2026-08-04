/**
 * @fileoverview Regenerate `src/mock/data` seed JSON from `examples/jsons`.
 *
 * Normalizes categories to `default` (for `REACT_APP_REP_TYPE=Default`),
 * stringifies AWSJSON site fields so the app can `JSON.parse` them, and
 * rewrites homepage featured/highlight links to local archive routes.
 *
 * @example
 * // npm run generate:mock-data
 * // node scripts/generate-mock-data.js
 */

const fs = require("fs");
const path = require("path");

/** @type {string} Repository root (parent of `scripts/`). */
const ROOT = path.join(__dirname, "..");

/** @type {string} Output directory for mock seed files. */
const OUT = path.join(ROOT, "src/mock/data");

/**
 * Site fields that AppSync stores as AWSJSON and the React app parses as strings.
 *
 * @type {string[]}
 */
const SITE_JSON_KEYS = [
  "browseCollections",
  "contact",
  "displayedAttributes",
  "homePage",
  "miradorOptions",
  "searchPage",
  "siteOptions",
  "sitePages"
];

/**
 * Return the trailing ARK suffix used in `/archive/:customKey` routes.
 *
 * @param {string|null|undefined} customKey - e.g. `ark:/53696/m58xyh90`.
 * @returns {string|null}
 */
function arkSuffix(customKey) {
  if (!customKey) return null;
  const parts = customKey.split("/");
  return parts[parts.length - 1];
}

const siteRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "examples/jsons/site.json"), "utf8")
);
const site = { ...siteRaw };
for (const key of SITE_JSON_KEYS) {
  if (site[key] != null && typeof site[key] !== "string") {
    site[key] = JSON.stringify(site[key]);
  }
}
site.siteTitle = "Local Mock Demo";

const collection = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "examples/jsons/democollection.json"),
    "utf8"
  )
);
collection.collection_category = "default";
collection.parent_collection = null;
collection.subject = ["Architecture", "Demo"];
collection.creator = ["Demo"];
collection.visibility = true;
if (typeof collection.description === "string") {
  collection.description = [collection.description];
}

const archives = [];
for (let i = 1; i <= 8; i++) {
  const a = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, `examples/jsons/archive_item${i}.json`),
      "utf8"
    )
  );
  a.item_category = "default";
  a.visibility = true;
  if (typeof a.description === "string") {
    a.description = [a.description];
  }
  if (!a.parent_collection) {
    a.parent_collection = [collection.id];
  }
  if (!a.heirarchy_path) {
    a.heirarchy_path = [collection.id];
  }
  archives.push(a);
}

const map = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "examples/jsons/democollectionmap.json"),
    "utf8"
  )
);
map.collectionmap_category = "default";

const pageContents = [
  {
    id: "mock-about",
    page_content_category: "default",
    content:
      "<h1>About</h1><p>This is local mock content for the About page.</p>"
  },
  {
    id: "mock-terms",
    page_content_category: "default",
    content:
      "<h1>Permissions</h1><p>This is local mock permissions content.</p>"
  }
];

const sitePages = JSON.parse(site.sitePages);
sitePages.about.data_url = "https://example.com/mock/about.html";
sitePages.terms.data_url = "https://example.com/mock/terms.html";
site.sitePages = JSON.stringify(sitePages);

const homePage = JSON.parse(site.homePage);
homePage.featuredItems = homePage.featuredItems.slice(0, 3).map((item, idx) => {
  const archive = archives[idx];
  return {
    ...item,
    src: archive?.thumbnail_path || item.src,
    link: `/archive/${arkSuffix(archive?.custom_key) || archive?.identifier}`
  };
});
homePage.staticImage.src = collection.thumbnail_path;
homePage.collectionHighlights = homePage.collectionHighlights.map((h, idx) => ({
  ...h,
  src: archives[idx]?.thumbnail_path || h.src,
  link: "/search?q=&field=title&view=Gallery&category=archive"
}));
homePage.sponsors = homePage.sponsors.map((s) => ({
  ...s,
  src: collection.thumbnail_path
}));
site.homePage = JSON.stringify(homePage);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "site.json"), JSON.stringify(site, null, 2));
fs.writeFileSync(
  path.join(OUT, "collections.json"),
  JSON.stringify([collection], null, 2)
);
fs.writeFileSync(
  path.join(OUT, "archives.json"),
  JSON.stringify(archives, null, 2)
);
fs.writeFileSync(
  path.join(OUT, "collectionmaps.json"),
  JSON.stringify([map], null, 2)
);
fs.writeFileSync(
  path.join(OUT, "pageContents.json"),
  JSON.stringify(pageContents, null, 2)
);

console.log("Wrote mock seed data to src/mock/data");
console.log(
  "Archive routes:",
  archives.map((a) => `/archive/${arkSuffix(a.custom_key)}`).join(", ")
);
