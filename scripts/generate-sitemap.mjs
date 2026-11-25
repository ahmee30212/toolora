import { readFileSync, writeFileSync } from "node:fs";

const site = "https://app.gettoolora.workers.dev";
const catalog = readFileSync(new URL("../src/data/tools.ts", import.meta.url), "utf8");
const categoriesBlock = catalog.match(/export const categories = \[([\s\S]*?)\] as const/)?.[1] ?? "";
const toolsBlock = catalog.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const categorySlugs = [...categoriesBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const toolSlugs = [...toolsBlock.matchAll(/\{\s*slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (!categorySlugs.length || !toolSlugs.length) throw new Error("Cannot generate sitemap: the Toolora catalog is empty.");

const paths = [
  "/", "/search/", "/privacy/", "/terms/", "/community/",
  ...categorySlugs.map((slug) => "/categories/" + slug + "/"),
  ...toolSlugs.map((slug) => "/tools/" + slug + "/")
];
const urls = paths.map((path) => "  <url><loc>" + site + path + "</loc></url>").join("\n");
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n";
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log("Generated sitemap with " + paths.length + " canonical URLs.");
