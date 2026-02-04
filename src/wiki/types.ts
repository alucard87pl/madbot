/**
 * Shared types for wiki lookup.
 * Providers (MediaWiki/Fandom, or other backends later) implement WikiProvider.
 */

export interface WikiSearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface WikiSearchResponse {
  /** Search results; empty when no match or on error */
  results: WikiSearchResult[];
  /** Optional suggestion when no results (e.g. "Did you mean ...") */
  suggestion?: string;
  /** Human-readable message when no results or on error */
  message?: string;
  /** True if the backend reported an error (e.g. network, rate limit) */
  error?: boolean;
}

/**
 * Interface for a wiki lookup backend.
 * Implementations: MediaWiki (Fandom), and later other wiki engines.
 */
export interface WikiProvider {
  /** Display name of the wiki (e.g. "Memory Alpha") */
  name: string;
  /** Base URL of the wiki (e.g. "https://memory-alpha.fandom.com") */
  baseUrl: string;
  /**
   * Run a search and return results.
   * Handles no results, typos, and errors in a wiki-consistent way.
   */
  search(query: string, limit?: number): Promise<WikiSearchResponse>;
}

export interface WikiProviderConfig {
  name: string;
  baseUrl: string;
  /** Optional: API endpoint if different from baseUrl + "/api.php" (MediaWiki) */
  apiUrl?: string;
}
