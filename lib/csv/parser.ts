/**
 * lib/csv/parser.ts
 *
 * Facebook Ads CSV parser.
 *
 * Accepts raw CSV text, uses the column mapper to detect headers intelligently,
 * then returns a typed array of ParsedAdSet objects with all numeric fields
 * properly coerced and inactive / zero-spend rows filtered out.
 */

import { detectColumns, mapRow, buildDetectionSummary } from "./column-mapper";
import type { ColumnDetectionResult } from "./column-mapper";

// ─────────────────────────────────────────────────────────────────────────────
// Output type
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedAdSet {
  // Identity
  ad_set_name:      string | null;
  campaign_name:    string | null;
  ad_name:          string | null;
  status:           string | null;

  // Spend & Budget
  amount_spent:     number;
  budget:           number | null;
  budget_type:      string | null;

  // Reach & Delivery
  impressions:      number;
  cpm:              number;
  reach:            number;
  frequency:        number;

  // Clicks & Cost
  ctr:              number;
  link_clicks:      number;
  cpc:              number;

  // Performance
  purchase_roas:    number;
  results:          number;
  result_type:      string | null;
  cost_per_result:  number;

  // Date range
  date_start:       string | null;
  date_end:         string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full parser output
// ─────────────────────────────────────────────────────────────────────────────

export interface CsvParseResult {
  /** Rows that passed all filters, with standardised types. */
  rows: ParsedAdSet[];
  /** How many raw rows were in the CSV (excluding the header). */
  total_rows: number;
  /** How many rows were skipped (inactive status or zero spend). */
  skipped_rows: number;
  /** Which internal keys were successfully mapped and which were absent. */
  columns_detected: {
    found: string[];
    missing: string[];
    mapping: ColumnDetectionResult;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Robustly parses a single CSV line, handling:
 * - Quoted fields (may contain commas or newlines)
 * - Escaped quotes ("")
 * - Trailing \r from Windows line endings
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  // Push the last field (strip trailing \r for Windows CRLF)
  fields.push(current.replace(/\r$/, "").trim());

  return fields;
}

/**
 * Converts a raw cell string to a float.
 * Strips currency symbols, commas, percent signs, and whitespace.
 * Returns 0 if the cell is empty or non-numeric.
 */
function toFloat(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[$,%\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Returns true if the row should be skipped:
 * - amount_spent is 0 (no real data)
 * - status indicates the ad set / ad is inactive
 *
 * Facebook uses values like "Off", "Paused", "Deleted" for inactive rows.
 * We keep "Active", "Learning", "Learning Limited", and empty status.
 */
const INACTIVE_STATUS = new Set([
  "off",
  "paused",
  "deleted",
  "inactive",
  "archived",
  "disapproved",
  "with issues",
  "not delivering",
  "scheduled",
  "draft",
]);

function shouldSkip(mapped: Record<string, string | null>): boolean {
  const spent = toFloat(mapped["amount_spent"]);
  if (spent === 0) return true;

  const status = (mapped["status"] ?? "").toLowerCase().trim();
  if (status && INACTIVE_STATUS.has(status)) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses raw CSV text exported from Meta Ads Manager.
 *
 * @param csvText  Raw UTF-8 text of the CSV file.
 * @returns        Structured CsvParseResult with typed rows and detection info.
 */
export function parseFacebookCsv(csvText: string): CsvParseResult {
  // Split into lines, remove completely blank lines
  const lines = csvText
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim() !== "");

  if (lines.length < 2) {
    return {
      rows: [],
      total_rows: 0,
      skipped_rows: 0,
      columns_detected: {
        found: [],
        missing: Object.keys(
          // dynamically pull all internal keys for the missing list
          Object.fromEntries(
            Object.entries({ ...buildDetectionSummary({}).missing }).map(
              ([k, v]) => [k, v]
            )
          )
        ),
        mapping: {},
      },
    };
  }

  // ── Parse header row ──────────────────────────────────────────────────────
  const rawHeaders = parseCsvLine(lines[0]);
  const detected = detectColumns(rawHeaders);
  const summary = buildDetectionSummary(detected);

  // ── Parse data rows ───────────────────────────────────────────────────────
  const dataLines = lines.slice(1);
  let skipped = 0;
  const rows: ParsedAdSet[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;

    const values = parseCsvLine(line);

    // Build a raw row map: header string → cell value
    const rawRow: Record<string, string> = {};
    for (let i = 0; i < rawHeaders.length; i++) {
      rawRow[rawHeaders[i]] = values[i] ?? "";
    }

    // Map to internal keys
    const mapped = mapRow(rawRow, detected);

    // Apply skip filters
    if (shouldSkip(mapped)) {
      skipped++;
      continue;
    }

    // Coerce to typed ParsedAdSet
    const adSet: ParsedAdSet = {
      ad_set_name:     mapped["ad_set_name"] ?? null,
      campaign_name:   mapped["campaign_name"] ?? null,
      ad_name:         mapped["ad_name"] ?? null,
      status:          mapped["status"] ?? null,

      amount_spent:    toFloat(mapped["amount_spent"]),
      budget:          mapped["budget"] !== null ? toFloat(mapped["budget"]) : null,
      budget_type:     mapped["budget_type"] ?? null,

      impressions:     toFloat(mapped["impressions"]),
      cpm:             toFloat(mapped["cpm"]),
      reach:           toFloat(mapped["reach"]),
      frequency:       toFloat(mapped["frequency"]),

      ctr:             toFloat(mapped["ctr"]),
      link_clicks:     toFloat(mapped["link_clicks"]),
      cpc:             toFloat(mapped["cpc"]),

      purchase_roas:   toFloat(mapped["purchase_roas"]),
      results:         toFloat(mapped["results"]),
      result_type:     mapped["result_type"] ?? null,
      cost_per_result: toFloat(mapped["cost_per_result"]),

      date_start:      mapped["date_start"] ?? null,
      date_end:        mapped["date_end"] ?? null,
    };

    rows.push(adSet);
  }

  return {
    rows,
    total_rows: dataLines.length,
    skipped_rows: skipped,
    columns_detected: {
      found: summary.found,
      missing: summary.missing,
      mapping: detected,
    },
  };
}
