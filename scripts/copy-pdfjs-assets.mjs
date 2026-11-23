import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const packageRoot = new URL("../node_modules/pdfjs-dist/", import.meta.url);
const outputRoot = new URL("../public/pdfjs/", import.meta.url);
const folders = ["cmaps", "iccs", "image_decoders", "standard_fonts", "wasm"];

mkdirSync(outputRoot, { recursive: true });
for (const folder of folders) {
  const source = new URL(folder + "/", packageRoot);
  const destination = new URL(folder + "/", outputRoot);
  if (!existsSync(source)) throw new Error("Missing PDF.js runtime folder: " + folder);
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}
console.log("Copied pinned PDF.js runtime assets: " + folders.join(", "));
