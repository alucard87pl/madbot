#!/usr/bin/env node
/**
 * Parse a wiki-request issue body and output the new WIKIS entry line.
 * Reads from stdin or ISSUE_BODY env. Exits 1 if parsing fails.
 * Output: one line to insert into wikis.ts (e.g. '  { code: "x", name: "y", ... },')
 */

const body = process.env.ISSUE_BODY || await readStdin();

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (ch) => chunks.push(ch));
    process.stdin.on("end", () => resolve(chunks.join("")));
  });
}

function extractSection(body, heading) {
  const regex = new RegExp(`##\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  const m = body.match(regex);
  const raw = m ? m[1].trim() : "";
  return raw.replace(/\s+/g, " ").trim();
}

function escapeForTsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

const code = extractSection(body, "Wiki code").replace(/[^a-z0-9]/gi, "").toLowerCase();
const name = extractSection(body, "Display name");
const baseUrl = extractSection(body, "Base URL").replace(/\/+$/, "");
const label = extractSection(body, "Short label");

if (!code || !name || !baseUrl || !label) {
  console.error("parse-wiki-request: missing field(s). Got code=%s name=%s baseUrl=%s label=%s", code, name, baseUrl, label);
  process.exit(1);
}

const line = `  { code: "${escapeForTsString(code)}", name: "${escapeForTsString(name)}", baseUrl: "${escapeForTsString(baseUrl)}", label: "${escapeForTsString(label)}" },`;
console.log(line);
