export const productAnalyzerPrompt = (
  productName: string,
  productCost: number,
  sellingPrice: number,
  description?: string,
) => `
Analyze the following product for a dropshipping business targeting African e-commerce markets:

Product Name: ${productName}
Product Cost: $${productCost}
Selling Price: $${sellingPrice}
${description ? `Additional Info: ${description}` : ""}

Provide a comprehensive analysis and return a strict JSON object matching exactly this schema (no extra keys, no markdown):

{
  "category": "string — the product category or niche (e.g. 'Health & Beauty', 'Home & Kitchen')",
  "demand": "HIGH" | "MEDIUM" | "LOW",
  "competition": "HIGH" | "MEDIUM" | "LOW",
  "emotionalTriggers": ["string — emotional trigger 1", "string — emotional trigger 2"],
  "difficultyScore": number (1–10, where 10 is hardest to sell),
  "marketOpportunity": number (1–10, where 10 is the best opportunity),
  "riskScore": "LOW" | "MEDIUM" | "HIGH",
  "marketScore": number (1–10, overall market attractiveness),
  "productScore": number (1–10, overall product quality/viability),
  "mediaBuyerReport": {
    "summary": "string — executive summary of the product's advertising potential",
    "recommendation": "string — clear BUY / SKIP / TEST recommendation with rationale",
    "strengths": ["string — strength 1", "string — strength 2"],
    "weaknesses": ["string — weakness 1", "string — weakness 2"],
    "nextActions": ["string — immediate next action 1", "string — immediate next action 2"]
  },
  "targetAudience": [
    "string — specific audience segment (e.g. 'Women aged 25–40 interested in skincare')",
    "string — another segment"
  ],
  "pricingRecommendations": [
    "string — actionable pricing strategy (e.g. 'Launch at $19.99 with a 30% introductory discount')",
    "string — another recommendation"
  ],
  "risks": [
    "string — specific risk factor (e.g. 'High return rate expected due to sizing issues')",
    "string — another risk"
  ]
}

Rules:
- Return ONLY the raw JSON object. No markdown, no code fences.
- All array fields must have at least 2 items.
- Scores must be integers.
- Base analysis on African e-commerce market context (Nigeria, Ghana, Kenya, Morocco, etc.).
`;
