#!/usr/bin/env node
/**
 * Generate sitemap.xml from courts + published blog post files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const baseUrl = "https://thecourtdirect.com";

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about", priority: "0.8", changefreq: "monthly" },
  { loc: "/blog", priority: "0.9", changefreq: "daily" },
  { loc: "/find-court", priority: "0.9", changefreq: "weekly" },
  { loc: "/directory", priority: "0.8", changefreq: "weekly" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "/legal-terms", priority: "0.6", changefreq: "monthly" },
  { loc: "/privacy-policy", priority: "0.5", changefreq: "yearly" },
  { loc: "/terms-of-service", priority: "0.5", changefreq: "yearly" },
  { loc: "/write-for-us-law", priority: "0.7", changefreq: "monthly" },
  { loc: "/sitemap", priority: "0.3", changefreq: "monthly" },
];

function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${baseUrl}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const page of staticPages) {
  lines.push(urlEntry(page.loc, page.changefreq, page.priority));
}

const courtsPath = path.join(root, "public", "data", "courts.json");
const courts = JSON.parse(fs.readFileSync(courtsPath, "utf8"));
console.log(`Adding ${courts.length} court pages...`);
for (const court of courts) {
  lines.push(urlEntry(`/court/${court.id}`, "monthly", "0.7"));
}

const postsDir = path.join(root, "public", "data", "posts");
const postFiles = fs.existsSync(postsDir)
  ? fs.readdirSync(postsDir).filter((f) => f.endsWith(".json"))
  : [];
console.log(`Adding ${postFiles.length} published blog post pages...`);
for (const file of postFiles) {
  const slug = file.replace(/\.json$/, "");
  lines.push(urlEntry(`/${slug}`, "monthly", "0.6"));
}

lines.push("</urlset>");

const outPublic = path.join(root, "public", "sitemap.xml");
const outDist = path.join(root, "dist", "sitemap.xml");
const xml = lines.join("\n");
fs.writeFileSync(outPublic, xml, "utf8");
if (fs.existsSync(path.join(root, "dist"))) {
  fs.writeFileSync(outDist, xml, "utf8");
}

console.log(`✓ Sitemap generated with ${staticPages.length + courts.length + postFiles.length} URLs`);
