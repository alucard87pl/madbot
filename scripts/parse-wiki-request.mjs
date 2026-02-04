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

// Stop at next section: ## or ### or ** (issue form can use ### headings)
const NEXT_SECTION = "(?=\\n##\\s|\\n###\\s|\\n\\*\\*|$)";

function extractSection(body, heading, altPattern) {
  // Markdown template: ## Wiki code ... or ### Wiki code (GitHub form output)
  let regex = new RegExp(`(?:##|###)\\s*${heading}[^\\n]*\\n([\\s\\S]*?)${NEXT_SECTION}`, "i");
  let m = body.match(regex);
  if (!m && altPattern) {
    // Issue form bold: **Wiki code (short tag)** or **Display name**
    regex = new RegExp(altPattern, "i");
    m = body.match(regex);
  }
  const raw = m ? m[1].trim() : "";
  return raw.replace(/\s+/g, " ").trim();
}

function escapeForTsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

// Accept both markdown (## Heading) and issue form (**Label**) body format
const code = (
  extractSection(body, "Wiki code", "\\*\\*Wiki code[^*]*\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)") ||
  extractSection(body, "Wiki code")
).replace(/[^a-z0-9]/gi, "").toLowerCase();
const name = extractSection(body, "Display name", "\\*\\*Display name\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)") || extractSection(body, "Display name");
const baseUrl = (extractSection(body, "Base URL", "\\*\\*Base URL\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)") || extractSection(body, "Base URL")).replace(/\/+$/, "");
const label = extractSection(body, "Short label", "\\*\\*Short label[^*]*\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)") || extractSection(body, "Short label");

if (!code || !name || !baseUrl || !label) {
  console.error("parse-wiki-request: missing field(s). Got code=%s name=%s baseUrl=%s label=%s", code, name, baseUrl, label);
  process.exit(1);
}

const line = `  { code: "${escapeForTsString(code)}", name: "${escapeForTsString(name)}", baseUrl: "${escapeForTsString(baseUrl)}", label: "${escapeForTsString(label)}" },`;
console.log(line);
