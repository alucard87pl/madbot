/**
 * Wiki list: code, display name, base URL, and short label for Discord.
 * Only this file and providers.ts use this; add entries here to register a new wiki.
 */

export interface WikiEntry {
  code: string;
  name: string;
  baseUrl: string;
  label: string;
}

export const WIKIS: WikiEntry[] = [
  { code: "ma", name: "Memory Alpha", baseUrl: "https://memory-alpha.fandom.com", label: "Star Trek" },
  { code: "sgc", name: "SGCommand", baseUrl: "https://stargate.fandom.com", label: "Stargate" },
  { code: "b5", name: "The Babylon Project", baseUrl: "https://babylon5.fandom.com", label: "Babylon 5" },
];
