import { z } from "zod";

export const productResearchSchema = z.object({
  productIntelligence: z.object({
    problemSolved: z.string().describe("What core problem does the product solve?"),
    painLevel: z.number().int().min(1).max(10).describe("Pain level of the target user (1-10)"),
    urgency: z.string().describe("Purchase urgency level (high/medium/low with explanation)"),
    impulseVsRational: z.string().describe("Is this an impulse buy or a rational buy and why?"),
    emotionalTriggers: z.array(z.string()).describe("Key emotional triggers driving the purchase"),
    objections: z.array(z.string()).describe("Objections from the target user"),
  }),
  marketIntelligence: z.object({
    maturity: z.string().describe("Market maturity level"),
    competition: z.string().describe("Market competition level"),
    demandTrend: z.string().describe("Current demand trend (growing/flat/declining)"),
    seasonality: z.string().describe("Seasonality considerations"),
    evergreenPotential: z.string().describe("Evergreen vs trending nature description"),
  }),
  customerProfile: z.object({
    age: z.string().describe("Target demographics age group"),
    gender: z.string().describe("Target demographics gender mix"),
    income: z.string().describe("Target income class"),
    lifestyle: z.string().describe("Target customer lifestyle details"),
    painPoints: z.array(z.string()).describe("Direct pain points related to this product"),
    dreamOutcome: z.string().describe("The customer's dream outcome after using this product"),
    motivations: z.array(z.string()).describe("Key purchase motivations"),
    objections: z.array(z.string()).describe("Buying objections specific to this customer profile"),
  }),
  marketingArsenal: z.object({
    angles: z.array(z.string()).describe("5+ marketing angles"),
    hooks: z.array(z.string()).describe("5+ scroll-stopping hooks"),
    offers: z.array(z.string()).describe("High-converting offer structures"),
    headlines: z.array(z.string()).describe("Ad headlines"),
    creativeConcepts: z.array(z.string()).describe("Detailed creative concepts (images/videos)"),
    landingPageStructure: z.array(z.string()).describe("Recommended landing page structure sections"),
    upsells: z.array(z.string()).describe("Upsell product ideas"),
    bundles: z.array(z.string()).describe("Bundle packages ideas"),
    pricingPsychology: z.string().describe("Pricing strategy explanation"),
  }),
  countryAnalysis: z.object({
    codQualityScore: z.number().int().min(0).max(100).describe("0-100 Cash-On-Delivery quality score"),
    deliveryReliability: z.string().describe("Courier delivery reliability in target country"),
    buyingPower: z.string().describe("Target buying power description"),
    competitionLevel: z.string().describe("Competition level in the country"),
    recommendedPriceRange: z.string().describe("Optimal selling price range in local currency/USD"),
    riskLevel: z.string().describe("Country specific operational risk level"),
    opportunityScore: z.number().int().min(0).max(100).describe("0-100 overall opportunity score"),
  }),
  finalRecommendation: z.object({
    status: z.enum(["GO", "NO-GO", "CONDITIONAL"]).describe("Overall launch recommendation"),
    score: z.number().int().min(0).max(100).describe("0-100 overall product research viability score"),
    reasoning: z.string().describe("Detailed logical backing for status and score"),
  }),
});

export type ProductResearchAiResult = z.infer<typeof productResearchSchema>;

export const advertisingAnalysisSchema = z.object({
  campaignHealthScore: z.number().int().min(0).max(100).describe("0-100 Campaign health score"),
  overallDecision: z.enum(["SCALE", "OPTIMIZE", "RETEST", "KILL"]).describe("Overall operational decision"),
  confidenceScore: z.number().int().min(0).max(100).describe("0-100 confidence score in the evaluation"),
  
  businessIntel: z.object({
    trueProfit: z.number().describe("Calculated Net Profit after confirmation and delivery rates"),
    netMargin: z.number().describe("True Net Profit Margin %"),
    breakEvenCpa: z.number().describe("Break-even Cost Per Acquisition"),
    breakEvenCpp: z.number().describe("Break-even Cost Per Purchase"),
    maxAcceptableCpc: z.number().describe("Maximum acceptable CPC"),
    maxAcceptableCpm: z.number().describe("Maximum acceptable CPM"),
    projectedMonthlyProfit: z.number().describe("Projected monthly profit run-rate"),
  }),

  creativeRanking: z.array(z.object({
    adName: z.string().describe("Facebook ad name"),
    rank: z.number().int().describe("Rank position (1 is best)"),
    ctr: z.number().describe("CTR (all) %"),
    spend: z.number().describe("Spend amount"),
    orders: z.number().describe("Raw Facebook orders"),
    status: z.enum(["WINNER", "AVERAGE", "LOSER"]).describe("Creative rating"),
    insights: z.string().describe("AI insights on creative performance"),
  })),

  winningAdSets: z.array(z.object({
    adSetName: z.string().describe("Ad set name"),
    spend: z.number().describe("Spend amount"),
    orders: z.number().describe("Orders generated"),
    cpp: z.number().describe("Cost per purchase"),
    roas: z.number().describe("Facebook ROAS"),
    reason: z.string().describe("AI reason for scaling recommendation"),
  })),

  losingAdSets: z.array(z.object({
    adSetName: z.string().describe("Ad set name"),
    spend: z.number().describe("Spend amount"),
    orders: z.number().describe("Orders generated"),
    cpp: z.number().describe("Cost per purchase"),
    roas: z.number().describe("Facebook ROAS"),
    issue: z.string().describe("Primary performance bottleneck"),
    recommendation: z.string().describe("Corrective action recommendation"),
  })),

  fatigueWarnings: z.array(z.object({
    targetName: z.string().describe("Target Campaign, Adset or Ad name"),
    frequency: z.number().describe("Current frequency"),
    warningType: z.string().describe("Fatigue warning type"),
    remedy: z.string().describe("AI remedy recommendation"),
  })),

  optimizationActions: z.array(z.object({
    action: z.string().describe("The exact action to perform"),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Priority order"),
    rationale: z.string().describe("Analytical reason behind action"),
  })),

  actionPlan: z.object({
    immediate: z.array(z.string()).describe("Actions to execute within 24 hours"),
    monitor: z.array(z.string()).describe("Metrics to monitor closely over next 3-7 days"),
    scaling: z.array(z.string()).describe("Scaling blueprint recommendation"),
    risk: z.array(z.string()).describe("Logistics/ad risks to manage"),
    nextBudget: z.number().describe("Recommended daily budget for next test phase"),
  }),
});

export type AdvertisingAnalysisAiResult = z.infer<typeof advertisingAnalysisSchema>;
