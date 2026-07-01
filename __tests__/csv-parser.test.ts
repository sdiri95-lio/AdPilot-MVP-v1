import { describe, it, expect } from "vitest";
import { parseFacebookCsv, buildHierarchy } from "@/lib/csv/parser";
import { detectColumns } from "@/lib/csv/column-mapper";

describe("Facebook Ads CSV Parser & Mapper", () => {
  const sampleHeaders = [
    "Reporting starts",
    "Reporting ends",
    "Ad set name",
    "Ad set delivery",
    "Amount spent (USD)",
    "Ad set budget",
    "Ad set budget type",
    "Impressions",
    "CPM (cost per 1,000 impressions) (USD)",
    "Reach",
    "Frequency",
    "CTR (all)",
    "Link clicks",
    "CPC (all) (USD)",
    "Purchase ROAS (return on ad spend)",
    "Attribution setting",
    "Results",
    "Result indicator",
    "Cost per results"
  ];

  it("should correctly detect and map standard column headers", () => {
    const detected = detectColumns(sampleHeaders);
    
    expect(detected.date_start).toBe("Reporting starts");
    expect(detected.date_end).toBe("Reporting ends");
    expect(detected.ad_set_name).toBe("Ad set name");
    expect(detected.status).toBe("Ad set delivery");
    expect(detected.amount_spent).toBe("Amount spent (USD)");
    expect(detected.budget).toBe("Ad set budget");
    expect(detected.budget_type).toBe("Ad set budget type");
    expect(detected.impressions).toBe("Impressions");
    expect(detected.cpm).toBe("CPM (cost per 1,000 impressions) (USD)");
    expect(detected.reach).toBe("Reach");
    expect(detected.frequency).toBe("Frequency");
    expect(detected.ctr).toBe("CTR (all)");
    expect(detected.link_clicks).toBe("Link clicks");
    expect(detected.cpc).toBe("CPC (all) (USD)");
    expect(detected.purchase_roas).toBe("Purchase ROAS (return on ad spend)");
    expect(detected.results).toBe("Results");
    expect(detected.result_type).toBe("Result indicator");
    expect(detected.cost_per_result).toBe("Cost per results");
  });

  it("should parse, coerce, and filter rows from a valid CSV string", () => {
    const csvContent = [
      sampleHeaders.map(h => `"${h}"`).join(","),
      // Row 1: Active, positive spend, valid metrics (Should keep)
      `"2026-06-01","2026-06-07","NG - ABO - Conversions","active","$150.50","$50.00","Daily",10000,"$15.05",8500,1.18,"1.50%",150,"$1.00",2.5,"Conversions",15,"Purchases","$10.03"`,
      // Row 2: Inactive, positive spend (Should skip)
      `"2026-06-01","2026-06-07","NG - ABO - Conversions 2","paused","$50.00","$50.00","Daily",3000,"$16.67",2500,1.2,"1.00%",30,"$1.67",1.5,"Conversions",3,"Purchases","$16.67"`,
      // Row 3: Active, zero spend (Should skip)
      `"2026-06-01","2026-06-07","NG - ABO - Conversions 3","active","$0.00","$50.00","Daily",0,"$0.00",0,0,"0.00%",0,"$0.00",0,"Conversions",0,"Purchases","$0.00"`
    ].join("\n");

    const result = parseFacebookCsv(csvContent);

    expect(result.total_rows).toBe(3);
    expect(result.skipped_rows).toBe(2); // Row 2 (paused) and Row 3 (zero spend)
    expect(result.rows).toHaveLength(1);

    const activeRow = result.rows[0];
    expect(activeRow.ad_set_name).toBe("NG - ABO - Conversions");
    expect(activeRow.status).toBe("active");
    expect(activeRow.amount_spent).toBe(150.5);
    expect(activeRow.budget).toBe(50.0);
    expect(activeRow.budget_type).toBe("Daily");
    expect(activeRow.impressions).toBe(10000);
    expect(activeRow.cpm).toBe(15.05);
    expect(activeRow.reach).toBe(8500);
    expect(activeRow.frequency).toBe(1.18);
    expect(activeRow.ctr).toBe(1.5); // "1.50%" coerced to 1.5
    expect(activeRow.link_clicks).toBe(150);
    expect(activeRow.cpc).toBe(1.0);
    expect(activeRow.purchase_roas).toBe(2.5);
    expect(activeRow.results).toBe(15);
    expect(activeRow.result_type).toBe("Purchases");
    expect(activeRow.cost_per_result).toBe(10.03);
    expect(activeRow.date_start).toBe("2026-06-01");
    expect(activeRow.date_end).toBe("2026-06-07");
  });

  it("should construct a correct campaign -> adset -> ad hierarchy", () => {
    const customHeaders = [...sampleHeaders, "Ad name", "Campaign name"];
    const csvContent = [
      customHeaders.map(h => `"${h}"`).join(","),
      // Ad level row 1: Campaign A, Adset 1, Ad 1 (Should keep)
      `"2026-06-01","2026-06-07","NG - Adset 1","active","$100.00","$50.00","Daily",5000,"$20.00",4000,1.25,"2.00%",100,"$1.00",2.0,"Conversions",10,"Purchases","$10.00","NG - Ad 1","NG - Campaign A"`,
      // Ad level row 2: Campaign A, Adset 1, Ad 2 (Should keep)
      `"2026-06-01","2026-06-07","NG - Adset 1","active","$50.00","$50.00","Daily",2500,"$20.00",2000,1.25,"1.20%",30,"$1.67",1.0,"Conversions",2,"Purchases","$25.00","NG - Ad 2","NG - Campaign A"`,
      // Ad level row 3: Campaign A, Adset 2, Ad 3 (Should keep)
      `"2026-06-01","2026-06-07","NG - Adset 2","active","$150.00","$100.00","Daily",10000,"$15.00",8000,1.25,"1.50%",150,"$1.00",2.5,"Conversions",15,"Purchases","$10.00","NG - Ad 3","NG - Campaign A"`
    ].join("\n");

    const result = parseFacebookCsv(csvContent);
    const campaigns = buildHierarchy(result.rows);

    expect(campaigns).toHaveLength(1);
    const campaign = campaigns[0];
    expect(campaign.campaign_name).toBe("NG - Campaign A");
    expect(campaign.amount_spent).toBe(300.0);
    expect(campaign.impressions).toBe(17500);
    expect(campaign.link_clicks).toBe(280);
    expect(campaign.results).toBe(27);
    // Calculated CTR: 280 / 17500 = 1.6%
    expect(campaign.ctr).toBeCloseTo(1.6, 1);
    // Calculated CPC: 300 / 280 = $1.07
    expect(campaign.cpc).toBeCloseTo(1.07, 2);

    expect(campaign.adSets).toHaveLength(2);
    const adset1 = campaign.adSets.find(a => a.ad_set_name === "NG - Adset 1");
    expect(adset1).toBeDefined();
    expect(adset1!.amount_spent).toBe(150.0);
    expect(adset1!.ads).toHaveLength(2);

    const adset2 = campaign.adSets.find(a => a.ad_set_name === "NG - Adset 2");
    expect(adset2).toBeDefined();
    expect(adset2!.amount_spent).toBe(150.0);
    expect(adset2!.ads).toHaveLength(1);
  });
});
