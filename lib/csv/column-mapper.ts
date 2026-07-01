export const COLUMN_VARIANTS: Record<string, string[]> = {
  campaign_name: ["campaign name", "campaign"],
  ad_set_name: ["ad set name", "adset name", "ad set"],
  ad_name: ["ad name", "ad"],
  status: ["delivery", "status", "ad set delivery", "campaign delivery"],
  amount_spent: ["amount spent", "spend", "cost"],
  budget: ["budget", "ad set budget"],
  budget_type: ["budget type", "ad set budget type"],
  impressions: ["impressions"],
  cpm: ["cpm", "cost per 1000"],
  reach: ["reach"],
  frequency: ["frequency"],
  ctr: ["ctr", "click-through rate", "click through rate"],
  link_clicks: ["link clicks", "clicks"],
  cpc: ["cpc", "cost per click"],
  purchase_roas: ["purchase roas", "roas", "return on ad spend"],
  results: ["results", "purchases", "leads", "conversions"],
  result_type: ["result indicator", "result type"],
  cost_per_result: ["cost per result", "cost per results", "cpa", "cpp"],
  date_start: ["reporting starts", "start date", "date start"],
  date_end: ["reporting ends", "end date", "date end"],
};

export function detectColumns(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};

  for (const [key, variants] of Object.entries(COLUMN_VARIANTS)) {
    let matchedHeader: string | null = null;

    // Check exact match (case-insensitive, trimmed)
    for (const h of headers) {
      const cleanedHeader = h.toLowerCase().trim();
      const match = variants.find(v => cleanedHeader === v.toLowerCase().trim());
      if (match) {
        matchedHeader = h;
        break;
      }
    }

    // Fallback: Check containing text match
    if (!matchedHeader) {
      for (const h of headers) {
        const cleanedHeader = h.toLowerCase().trim();
        const match = variants.find(v => cleanedHeader.includes(v.toLowerCase().trim()));
        if (match) {
          matchedHeader = h;
          break;
        }
      }
    }

    mapping[key] = matchedHeader;
  }

  return mapping;
}

export function mapRow(row: Record<string, string>, mapping: Record<string, string | null>): Record<string, string | null> {
  const mapped: Record<string, string | null> = {};
  for (const [key, header] of Object.entries(mapping)) {
    mapped[key] = header ? row[header] || null : null;
  }
  return mapped;
}
