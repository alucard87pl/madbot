/**
 * MediaWiki API client (Fandom wikis use this).
 * Handles search, no-results, and optional suggestion handling.
 */

import type { WikiProvider, WikiProviderConfig, WikiSearchResponse, WikiSearchResult } from "./types.js";

const DEFAULT_LIMIT = 5;
const USER_AGENT = "MadbotWikiLookup/0.1 (Discord bot; https://github.com/alucard87pl/madbot)";

function buildArticleUrl(baseUrl: string, title: string): string {
  const path = title.replace(/ /g, "_");
  const encoded = encodeURIComponent(path).replace(/%2F/g, "/");
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/wiki/${encoded}`;
}

/**
 * Raw response from MediaWiki API action=query list=search
 */
interface MediaWikiSearchApiResponse {
  query?: {
    search?: Array<{ title: string; snippet?: string }>;
    searchinfo?: { totalhits?: number };
  };
  error?: { code: string; info: string };
}

/**
 * OpenSearch response: [ searchTerm, titles[], descriptions[], urls[] ]
 * Used for suggestions when full search returns no results.
 */
type OpenSearchResponse = [string, string[], string[], string[]];

export function createMediaWikiProvider(config: WikiProviderConfig): WikiProvider {
  const apiUrl = config.apiUrl ?? `${config.baseUrl.replace(/\/$/, "")}/api.php`;
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    name: config.name,
    baseUrl,

    async search(query: string, limit: number = DEFAULT_LIMIT): Promise<WikiSearchResponse> {
      const trimmed = query.trim();
      if (!trimmed) {
        return {
          results: [],
          message: "Please enter a search term.",
          error: false,
        };
      }

      const params = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: trimmed,
        srlimit: String(Math.min(limit, 10)),
        srprop: "snippet",
        format: "json",
        origin: "*",
      });

      const url = `${apiUrl}?${params.toString()}`;
      let res: Response;
      try {
        res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(10_000),
        });
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        return {
          results: [],
          message: `Search failed: ${err.message}. Please try again later.`,
          error: true,
        };
      }

      if (!res.ok) {
        return {
          results: [],
          message: `Wiki returned ${res.status}. Please try again later.`,
          error: true,
        };
      }

      const data = (await res.json()) as MediaWikiSearchApiResponse;

      if (data.error) {
        return {
          results: [],
          message: `Wiki API error: ${data.error.info || data.error.code}.`,
          error: true,
        };
      }

      const hits = data.query?.search ?? [];

      const results: WikiSearchResult[] = hits.map((hit) => ({
        title: hit.title,
        url: buildArticleUrl(baseUrl, hit.title),
        snippet: hit.snippet ? stripHtml(hit.snippet) : undefined,
      }));

      if (results.length > 0) {
        return { results };
      }

      // No results: try OpenSearch for suggestions (e.g. "did you mean")
      const suggestion = await fetchOpenSearchSuggestion(apiUrl, trimmed);
      return {
        results: [],
        suggestion: suggestion ?? undefined,
        message: suggestion
          ? `No exact results. Did you mean: **${suggestion}**?`
          : `No results found for "${trimmed}". Try different words or check the spelling.`,
        error: false,
      };
    },
  };
}

async function fetchOpenSearchSuggestion(apiUrl: string, query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: "3",
    format: "json",
    origin: "*",
  });
  const url = `${apiUrl}?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenSearchResponse;
    const [, titles] = data;
    if (Array.isArray(titles) && titles.length > 0) return titles[0];
  } catch {
    // ignore
  }
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}
