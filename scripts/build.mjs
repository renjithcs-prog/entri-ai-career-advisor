import { rmSync, mkdirSync, copyFileSync, cpSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");

const files = ["index.html", "app.js", "config.js", "styles.css", "entri-logo.svg"];
for (const file of files) copyFileSync(file, `dist/${file}`);

cpSync("data", "dist/data", { recursive: true });

console.log("Copied static site into dist/");
