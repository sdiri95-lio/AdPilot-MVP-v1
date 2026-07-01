export function testDecisionPrompt(
  productName: string,
  country: string,
  spend: number,
  orders: number,
  roas: number,
  ctr: number,
  cpc: number,
  cpp: number,
  deliveryRate: number,
  trueProfit: number,
  timelineEvents: any[]
): string {
  return `
You are a senior media buyer specializing in Cash On Delivery (COD) e-commerce in international markets.
Your task is to analyze the performance of a recent media buying test and determine the next logical operational step.

### Context:
- **Product**: ${productName}
- **Country**: ${country}
- **Spend**: $${spend.toFixed(2)}
- **Orders**: ${orders}
- **FB ROAS**: ${roas.toFixed(2)}
- **CTR**: ${ctr.toFixed(2)}%
- **CPC**: $${cpc.toFixed(2)}
- **CPP (Cost Per Purchase)**: $${cpp.toFixed(2)}
- **Delivery Rate**: ${deliveryRate}%
- **True Realized Profit**: $${trueProfit.toFixed(2)}

### Recent Timeline Events:
${timelineEvents.map(e => `- ${e.title}: ${e.description || ""}`).join('\n') || "None recorded."}

### Evaluation Criteria:
- If True Profit is negative but CTR is high (>2%) and CPC is low, the issue might be the offer, landing page, or delivery rate. This warrants a **RETEST**.
- If True Profit is highly positive, Delivery Rate is acceptable (>50%), and the timeline doesn't already show massive scaling, the decision is **SCALE**.
- If True Profit is negative, CTR is low (<1%), and CPC is high, the market rejects the product. The decision is **KILL**.
- If scaling has been exhausted and True Profit remains high, or if MOQ requirements are clear, the next step is **IMPORT**.

Output the exact decision, a confidence score (0-100), a short reasoning paragraph, and a specific "nextAction" operational command (e.g., "Duplicate campaign with 20% budget increase", or "Retest with Offer B", or "Kill immediately to save budget").
`;
}
