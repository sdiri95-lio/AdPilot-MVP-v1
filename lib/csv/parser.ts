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

// ─────────────────────────────────────────────────────────────────────────────
// Hierarchical Node Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface AdNode {
  ad_name: string;
  status: string | null;
  amount_spent: number;
  impressions: number;
  reach: number;
  frequency: number;
  link_clicks: number;
  results: number;
  cost_per_result: number;
  ctr: number;
  cpc: number;
  cpm: number;
  purchase_roas: number;
}

export interface AdSetNode {
  ad_set_name: string;
  status: string | null;
  budget: number | null;
  budget_type: string | null;
  amount_spent: number;
  impressions: number;
  reach: number;
  frequency: number;
  link_clicks: number;
  results: number;
  cost_per_result: number;
  ctr: number;
  cpc: number;
  cpm: number;
  purchase_roas: number;
  ads: AdNode[];
}

export interface CampaignNode {
  campaign_name: string;
  status: string | null;
  amount_spent: number;
  impressions: number;
  reach: number;
  frequency: number;
  link_clicks: number;
  results: number;
  cost_per_result: number;
  ctr: number;
  cpc: number;
  cpm: number;
  purchase_roas: number;
  adSets: AdSetNode[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Hierarchy Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildHierarchy(rows: ParsedAdSet[]): CampaignNode[] {
  const campaignsMap = new Map<string, CampaignNode>();
  const adSetsMap = new Map<string, Map<string, AdSetNode>>();

  for (const row of rows) {
    const campaignName = row.campaign_name || "Unknown Campaign";
    const adSetName = row.ad_set_name;
    const adName = row.ad_name;

    // 1. Ensure CampaignNode exists
    if (!campaignsMap.has(campaignName)) {
      campaignsMap.set(campaignName, {
        campaign_name: campaignName,
        status: row.status,
        amount_spent: 0,
        impressions: 0,
        reach: 0,
        frequency: 0,
        link_clicks: 0,
        results: 0,
        cost_per_result: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        purchase_roas: 0,
        adSets: [],
      });
      adSetsMap.set(campaignName, new Map<string, AdSetNode>());
    }

    const campaign = campaignsMap.get(campaignName)!;
    const campaignAdSets = adSetsMap.get(campaignName)!;

    // If this is campaign-level data only, aggregate directly on the campaign
    if (!adSetName) {
      campaign.amount_spent += row.amount_spent;
      campaign.impressions += row.impressions;
      campaign.reach += row.reach;
      campaign.link_clicks += row.link_clicks;
      campaign.results += row.results;
      campaign.frequency = Math.max(campaign.frequency, row.frequency);
      continue;
    }

    // 2. Ensure AdSetNode exists
    if (!campaignAdSets.has(adSetName)) {
      campaignAdSets.set(adSetName, {
        ad_set_name: adSetName,
        status: row.status,
        budget: row.budget,
        budget_type: row.budget_type,
        amount_spent: 0,
        impressions: 0,
        reach: 0,
        frequency: 0,
        link_clicks: 0,
        results: 0,
        cost_per_result: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        purchase_roas: 0,
        ads: [],
      });
    }

    const adSet = campaignAdSets.get(adSetName)!;

    // If this is adset-level data, aggregate on adset
    if (!adName) {
      adSet.amount_spent += row.amount_spent;
      adSet.impressions += row.impressions;
      adSet.reach += row.reach;
      adSet.link_clicks += row.link_clicks;
      adSet.results += row.results;
      adSet.frequency = Math.max(adSet.frequency, row.frequency);
      continue;
    }

    // 3. Create AdNode
    const adNode: AdNode = {
      ad_name: adName,
      status: row.status,
      amount_spent: row.amount_spent,
      impressions: row.impressions,
      reach: row.reach,
      frequency: row.frequency,
      link_clicks: row.link_clicks,
      results: row.results,
      cost_per_result: row.cost_per_result,
      ctr: row.ctr,
      cpc: row.cpc,
      cpm: row.cpm,
      purchase_roas: row.purchase_roas,
    };
    adSet.ads.push(adNode);

    // Aggregate values to AdSet level
    adSet.amount_spent += row.amount_spent;
    adSet.impressions += row.impressions;
    adSet.reach += row.reach;
    adSet.link_clicks += row.link_clicks;
    adSet.results += row.results;
    adSet.frequency = Math.max(adSet.frequency, row.frequency);
  }

  // Assemble and recalculate derived metrics for parent nodes
  const campaigns: CampaignNode[] = [];

  for (const [campaignName, campaign] of campaignsMap.entries()) {
    const campaignAdSets = adSetsMap.get(campaignName)!;

    for (const adSet of campaignAdSets.values()) {
      // Re-calculate derived metrics at AdSet level
      adSet.ctr = adSet.impressions > 0 ? (adSet.link_clicks / adSet.impressions) * 100 : 0;
      adSet.cpc = adSet.link_clicks > 0 ? adSet.amount_spent / adSet.link_clicks : 0;
      adSet.cpm = adSet.impressions > 0 ? (adSet.amount_spent / adSet.impressions) * 1000 : 0;
      adSet.cost_per_result = adSet.results > 0 ? adSet.amount_spent / adSet.results : 0;

      campaign.adSets.push(adSet);

      // Aggregate values to Campaign level from AdSets
      campaign.amount_spent += adSet.amount_spent;
      campaign.impressions += adSet.impressions;
      campaign.reach += adSet.reach;
      campaign.link_clicks += adSet.link_clicks;
      campaign.results += adSet.results;
      campaign.frequency = Math.max(campaign.frequency, adSet.frequency);
    }

    // Re-calculate derived metrics at Campaign level
    campaign.ctr = campaign.impressions > 0 ? (campaign.link_clicks / campaign.impressions) * 100 : 0;
    campaign.cpc = campaign.link_clicks > 0 ? campaign.amount_spent / campaign.link_clicks : 0;
    campaign.cpm = campaign.impressions > 0 ? (campaign.amount_spent / campaign.impressions) * 1000 : 0;
    campaign.cost_per_result = campaign.results > 0 ? campaign.amount_spent / campaign.results : 0;

    campaigns.push(campaign);
  }

  return campaigns;
}
