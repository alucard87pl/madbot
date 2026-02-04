#!/usr/bin/env node
/**
 * CLI to test wiki lookup without Discord.
 * Usage: npm run wiki -- "search query"
 *        npm run wiki -- ma Voyager
 *        npm run wiki -- sgc 1969
 * Codes: ma (Memory Alpha), sgc (Stargate Wiki). Omit for default (ma).
 */

import { getProvider, getRegisteredCodes } from "./wiki/index.js";

const args = process.argv.slice(2);
const codes = getRegisteredCodes();
const first = args[0]?.toLowerCase();

const wikiCode = first && codes.includes(first) ? first : null;
const query = (wikiCode ? args.slice(1) : args).join(" ").trim();

if (!query) {
  console.log("Usage: npm run wiki -- \"your search\"");
  console.log("       npm run wiki -- [wiki] \"search\"  e.g. ma Voyager, sgc 1969");
  console.log("Wiki codes:", codes.join(", "));
  process.exit(1);
}

const provider = getProvider(wikiCode);
const limit = 5;
console.log(`Searching ${provider.name} for: "${query}" (max ${limit} results)\n`);

const result = await provider.search(query, limit);

if (result.error) {
  console.log("Error:", result.message);
  process.exit(1);
}

if (result.results.length === 0) {
  console.log(result.message ?? "No results.");
  if (result.suggestion) console.log("Suggestion:", result.suggestion);
  process.exit(0);
}

console.log(`Found ${result.results.length} result(s):\n`);
for (const r of result.results) {
  console.log(`  ${r.title}`);
  console.log(`  ${r.url}`);
  if (r.snippet) console.log(`  ${r.snippet.slice(0, 120)}${r.snippet.length > 120 ? "…" : ""}`);
  console.log("");
}
