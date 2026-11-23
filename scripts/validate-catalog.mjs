import { readFileSync } from "node:fs";

const data = readFileSync(new URL("../src/data/tools.ts", import.meta.url), "utf8");
const iconSource = readFileSync(new URL("../src/components/Icon.astro", import.meta.url), "utf8");
const engineSource = readFileSync(new URL("../src/scripts/tool-engine.ts", import.meta.url), "utf8");

const categorySection = data.match(/export const categories = \[([\s\S]*?)\] as const/)?.[1] ?? "";
const toolSection = data.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
if (!categorySection || !toolSection) throw new Error("Could not read the Toolora category and tool catalog.");

const categories = new Set([...categorySection.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));
const tools = [...toolSection.matchAll(/\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*icon:\s*"([^"]+)",\s*status:\s*"([^"]+)"/g)]
  .map((match) => ({ slug: match[1], name: match[2], category: match[4], icon: match[5], status: match[6] }));

if (tools.length === 0) throw new Error("No tools were discovered in the catalog.");
const slugs = tools.map((tool) => tool.slug);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicates.length) throw new Error(`Duplicate tool slugs: ${[...new Set(duplicates)].join(", ")}`);

const aliasBlock = iconSource.match(/const aliases: Record<string, string> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const iconBlock = iconSource.match(/const icons: Record<string, string\[]> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const extraBlock = iconSource.match(/const extraIcons: Record<string, string\[]> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const keys = (block) => [...block.matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)].map((match) => match[1]);
const iconNames = new Set([...keys(aliasBlock), ...keys(iconBlock)]);
const extraNames = new Set(keys(extraBlock));
const engineCases = new Set([...engineSource.matchAll(/case\\s+"([^"]+)"/g)].map((match) => match[1]));
const specialHandlers = new Set([
  "image-compressor", "image-converter", "image-cropper", "image-resizer",
  "images-to-pdf", "pdf-to-images", "typing-speed-test", "text-to-speech"
]);
const errors = [];
for (const tool of tools) {
  if (!categories.has(tool.category)) errors.push(`${tool.slug}: unknown category "${tool.category}"`);
  if (!iconNames.has(tool.icon) && !extraNames.has(tool.icon)) errors.push(`${tool.slug}: missing SVG icon mapping "${tool.icon}"`);
  if (tool.status !== "ready" && tool.status !== "planned") errors.push(`${tool.slug}: invalid status "${tool.status}"`);
  if (tool.status === "ready" && !engineCases.has(tool.slug) && !specialHandlers.has(tool.slug)) errors.push(`${tool.slug}: marked ready but has no tool handler`);
}
if (errors.length) throw new Error(errors.join("\n"));

console.log(`Toolora checks passed: ${categories.size} categories, ${tools.length} tools, unique routes, mapped SVG icons and implemented ready tools.`);
