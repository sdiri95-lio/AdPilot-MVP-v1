/**
 * lib/csv/column-mapper.ts
 *
 * Intelligent Facebook Ads CSV column detector and mapper.
 *
 * Facebook Ads Manager exports are inconsistent — column names vary based on
 * the user's account language, selected metrics, and custom column sets.
 * This mapper uses keyword matching (not exact names) to normalize any export
 * into a consistent set of internal keys.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal key → possible Facebook column name variations
// Matching is case-insensitive and trims whitespace.
// ─────────────────────────────────────────────────────────────────────────────
export const COLUMN_VARIANTS: Record<string, string[]> = {
  ad_set_name:       ["ad set name", "adset name", "ad set"],
  campaign_name:     ["campaign name", "campaign"],
  ad_name:           ["ad name", "ad"],
  status:            ["ad set delivery", "campaign delivery", "delivery", "status"],
  amount_spent:      ["amount spent", "spend", "cost"],
  budget:            ["ad set budget", "campaign budget", "daily budget", "budget"],
  budget_type:       ["ad set budget type", "budget type"],
  impressions:       ["impressions"],
  cpm:               ["cpm (cost per 1,000 impressions)", "cpm", "cost per 1,000", "cost per 1000 impressions"],
  reach:             ["reach"],
  frequency:         ["frequency"],
  ctr:               ["ctr (all)", "ctr", "click-through rate"],
  link_clicks:       ["link clicks", "clicks"],
  cpc:               ["cpc (all)", "cpc", "cost per link click"],
  purchase_roas:     ["purchase roas (return on ad spend)", "purchase roas", "roas", "return on ad spend"],
  results:           ["results"],
  result_type:       ["result indicator", "result type"],
  cost_per_result:   ["cost per results", "cost per result"],
  date_start:        ["reporting starts", "date start", "start date"],
  date_end:          ["reporting ends", "date end", "end date"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Map of internal key → the actual header string found in this CSV, or null if absent. */
export type ColumnDetectionResult = Record<string, string | null>;

// ─────────────────────────────────────────────────────────────────────────────
// Normalise a raw header string for matching
// Strips parenthetical qualifiers like "(USD)", "(return on ad spend)", etc.
// so that "CPM (cost per 1,000 impressions) (USD)" matches "CPM (cost per 1,000 impressions)".
// ─────────────────────────────────────────────────────────────────────────────
function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\(usd\)/gi, "")        // strip currency qualifiers
    .replace(/\s+/g, " ")            // collapse whitespace
    .trim();
}

/**
 * Given an array of raw CSV headers, returns a map of:
 *   internalKey → rawHeaderString (exactly as it appears in the CSV, or null)
 *
 * Matching priority within each internal key's variant list:
 * 1. Exact normalised match
 * 2. "Starts with" match  (handles "CPM (cost per …)" matching variant "cpm")
 * 3. "Contains" match
 *
 * The first variant that matches for each internal key wins.
 */
export function detectColumns(rawHeaders: string[]): ColumnDetectionResult {
  const normalisedHeaders = rawHeaders.map((h) => ({
    raw: h,
    norm: normalise(h),
  }));

  const result: ColumnDetectionResult = {};

  for (const [internalKey, variants] of Object.entries(COLUMN_VARIANTS)) {
    let found: string | null = null;

    // Try each variant in priority order
    outer: for (const variant of variants) {
      const normVariant = variant.toLowerCase().trim();

      for (const { raw, norm } of normalisedHeaders) {
        // Priority 1: exact normalised match
        if (norm === normVariant) {
          found = raw;
          break outer;
        }
      }

      for (const { raw, norm } of normalisedHeaders) {
        // Priority 2: normalised header starts with the variant
        if (norm.startsWith(normVariant)) {
          found = raw;
          break outer;
        }
      }

      for (const { raw, norm } of normalisedHeaders) {
        // Priority 3: normalised header contains the variant
        if (norm.includes(normVariant)) {
          found = raw;
          break outer;
        }
      }
    }

    result[internalKey] = found;
  }

  return result;
}

/**
 * Given a row object (header → raw cell value) and a column detection result,
 * returns a standardised object with internal keys mapped to raw string values.
 * Returns null for any internal key whose column was not detected.
 */
export function mapRow(
  row: Record<string, string>,
  detected: ColumnDetectionResult
): Record<string, string | null> {
  const mapped: Record<string, string | null> = {};

  for (const [internalKey, rawHeader] of Object.entries(detected)) {
    mapped[internalKey] = rawHeader !== null ? (row[rawHeader] ?? null) : null;
  }

  return mapped;
}

/**
 * Returns a human-readable summary of which internal keys were detected
 * and which are missing — useful for the API response and debugging.
 */
export function buildDetectionSummary(detected: ColumnDetectionResult): {
  found: string[];
  missing: string[];
} {
  const found: string[] = [];
  const missing: string[] = [];

  for (const [key, rawHeader] of Object.entries(detected)) {
    if (rawHeader !== null) {
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  return { found, missing };
}
