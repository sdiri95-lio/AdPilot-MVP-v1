export const testStrategyPrompt = (productName: string, category: string, budget: number) => `
Create a Facebook Ads testing strategy for this dropshipping product:
Product Name: ${productName}
Category: ${category}
Available Budget: $${budget}

Return a JSON object matching this schema:
{
  "scenario": "MINIMUM" | "BEST" | "HIGH",
  "campaignType": "ABO" | "CBO",
  "adsetCount": number (min 1),
  "budgetPerAdset": number,
  "totalBudget": number,
  "targetingType": "TARGET" | "BROAD",
  "targetingDetails": { "interests": ["string"], "age": "string", "locations": ["string"] },
  "expectedSpend": number,
  "expectedLeads": number,
  "expectedOrders": number,
  "expectedRisk": "LOW" | "MEDIUM" | "HIGH"
}
`;
