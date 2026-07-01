import { detectColumns, mapRow } from "./column-mapper";

// ─────────────────────────────────────────────────────────────────────────────
// Parsed Row Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedAdSet {
  campaign_name: string | null;
  ad_set_name: string | null;
  ad_name: string | null;
  status: string | null;
  amount_spent: number;
  budget: number | null;
  budget_type: string | null;
  impressions: number;
  cpm: number;
  reach: number;
  frequency: number;
  ctr: number;
  link_clicks: number;
  cpc: number;
  purchase_roas: number;
  results: number;
  result_type: string | null;
  cost_per_result: number;
  date_start: string | null;
  date_end: string | null;
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
// CSV Line Parsing Helper (RFC-4180 compliant)
// ─────────────────────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Coercion Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toFloat(val: string | null | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

const INACTIVE_STATUS = new Set([
  "off", "paused", "deleted", "inactive", "archived", "disapproved", "with issues", "not delivering", "scheduled", "draft"
]);

function shouldSkip(status: string | null, spend: number): boolean {
  if (spend === 0) return true;
  if (!status) return false;
  return INACTIVE_STATUS.has(status.toLowerCase().trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Parser Export
// ─────────────────────────────────────────────────────────────────────────────

export function parseFacebookCsv(csvText: string): {
  rows: ParsedAdSet[];
  total_rows: number;
  skipped_rows: number;
  columns_detected: {
    found: string[];
    missing: string[];
    mapping: Record<string, string | null>;
  };
} {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const mapping = detectColumns(rawHeaders);

  const found = Object.keys(mapping).filter(k => mapping[k] !== null);
  const missing = Object.keys(mapping).filter(k => mapping[k] === null);

  const rows: ParsedAdSet[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawValues = parseCsvLine(lines[i]);
    
    // Construct raw object
    const rawRow: Record<string, string> = {};
    rawHeaders.forEach((header, idx) => {
      rawRow[header] = rawValues[idx] || "";
    });

    const mapped = mapRow(rawRow, mapping);

    const status = mapped["status"];
    const amount_spent = toFloat(mapped["amount_spent"]);

    if (shouldSkip(status, amount_spent)) {
      skipped++;
      continue;
    }

    const budget = mapped["budget"] !== null ? toFloat(mapped["budget"]) : null;

    rows.push({
      campaign_name: mapped["campaign_name"],
      ad_set_name: mapped["ad_set_name"],
      ad_name: mapped["ad_name"],
      status,
      amount_spent,
      budget,
      budget_type: mapped["budget_type"],
      impressions: toFloat(mapped["impressions"]),
      cpm: toFloat(mapped["cpm"]),
      reach: toFloat(mapped["reach"]),
      frequency: toFloat(mapped["frequency"]),
      ctr: toFloat(mapped["ctr"]),
      link_clicks: toFloat(mapped["link_clicks"]),
      cpc: toFloat(mapped["cpc"]),
      purchase_roas: toFloat(mapped["purchase_roas"]),
      results: toFloat(mapped["results"]),
      result_type: mapped["result_type"],
      cost_per_result: toFloat(mapped["cost_per_result"]),
      date_start: mapped["date_start"],
      date_end: mapped["date_end"],
    });
  }

  return {
    rows,
    total_rows: lines.length - 1,
    skipped_rows: skipped,
    columns_detected: {
      found,
      missing,
      mapping,
    },
  };
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

    // If this is campaign-level data only
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

    // If this is adset-level data
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

    // Aggregate to AdSet level
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
