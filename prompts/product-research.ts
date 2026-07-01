export function productResearchPrompt(
  name: string,
  productName: string,
  productCost: number,
  sellingPrice: number,
  shippingCost: number,
  serviceFee: number,
  targetCountry: string,
  scrapedContent: string
): string {
  return `
You are a senior dropshipping Product Researcher and logistics expert specializing in the African Cash-On-Delivery (COD) e-commerce market.
Your task is to conduct an in-depth product research and market feasibility audit for the following product:

### Product Parameters:
- **Project Name**: ${name}
- **Product Name**: ${productName}
- **Product Cost**: $${productCost.toFixed(2)}
- **Selling Price**: $${sellingPrice.toFixed(2)}
- **Outbound Shipping Cost**: $${shippingCost.toFixed(2)}
- **Local Service Fee (Call center, warehousing, fulfillment)**: $${serviceFee.toFixed(2)}
- **Target Country**: ${targetCountry}

### Scraped Webpage Context:
${scrapedContent}

### Your Instructions:
Perform a comprehensive, expert evaluation. You must evaluate the product specifically through the lens of Cash-On-Delivery e-commerce in Africa (addressing logistics hurdles, buyer behavior, courier reliability, and call-center confirmation rates).

#### 1. Product Intelligence:
- Problem Solved: What pain point does it solve?
- Pain Level: Scale of 1 to 10.
- Urgency: High/Medium/Low with justification.
- Impulse vs Rational: Buying type and why.
- Emotional Triggers: List of key emotional hooks.
- Objections: Objections users will raise.

#### 2. Market Intelligence:
- Maturity: Is this market early, growing, saturated, or declining?
- Competition: Competitor levels.
- Demand Trend: Growing/Flat/Declining.
- Seasonality: Hot/cold months, holidays.
- Evergreen Potential: Trend length.

#### 3. Customer Profile:
- Demographics: Age group, gender, income tier, lifestyle.
- Pain Points: Customer frustrations.
- Dream Outcome: The transformation they desire.
- Motivations: Motivations behind buying.
- Objections: Why they would cancel or reject COD packages at the door.

#### 4. Marketing Arsenal:
- Angles: Generate 5+ distinct positioning angles.
- Hooks: Generate 5+ scroll-stopping hooks.
- Offers: Recommend high-converting offer structures (e.g. Buy 1 Get 1, Bundles).
- Headlines: High CTR ad headlines.
- Creative Concepts: Copywriting concepts for videos/images.
- Landing Page Structure: Sequence of sections needed.
- Upsells & Bundles: Suggestions to increase Average Order Value (AOV).
- Pricing Psychology: Strategy for this target tier.

#### 5. Country Analysis (Nigeria, Kenya, Ghana, Morocco, Egypt, South Africa, Ivory Coast, Senegal, Cameroon, etc.):
- COD Quality Score: 0-100 rating of the target country's COD infrastructure.
- Delivery Reliability: Typical courier performance, route accessibility, and delivery timelines.
- Buying Power: Target population income and willingness to pay.
- Competition Level: In-country saturation.
- Recommended Price Range: Optimal local selling price range.
- Risk Level: Custom clearing, fake orders, route safety.
- Opportunity Score: 0-100 overall country opportunity score.

#### 6. Final Recommendation:
- Status: "GO" (launch immediately), "NO-GO" (do not launch), or "CONDITIONAL" (needs changes).
- Score: 0-100 product research score.
- Reasoning: Logical breakdown.

You must output a single valid JSON object matching the requested schema.
`;
}
