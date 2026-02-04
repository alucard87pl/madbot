/**
 * Builds providers from the wiki list and exposes lookup/choices.
 * All wiki handling goes through here; data lives in wikis.ts.
 */

import { createMediaWikiProvider } from "./mediawiki.js";
import type { WikiProvider } from "./types.js";
import { WIKIS } from "./wikis.js";

const byCode = new Map<string, WikiProvider>();
for (const w of WIKIS) {
  const provider = createMediaWikiProvider({
    name: w.name,
    baseUrl: w.baseUrl,
    apiUrl: `${w.baseUrl}/api.php`,
  });
  byCode.set(w.code, provider);
}

const defaultCode = WIKIS[0].code;

export function getProvider(code?: string | null): WikiProvider {
  if (!code || typeof code !== "string") return byCode.get(defaultCode)!;
  return byCode.get(code.toLowerCase().trim()) ?? byCode.get(defaultCode)!;
}

export function getRegistryChoices(): { name: string; value: string }[] {
  return WIKIS.map((w) => ({ name: `${w.code} – ${w.name}`, value: w.code }));
}

export function getRegisteredCodes(): string[] {
  return WIKIS.map((w) => w.code);
}
