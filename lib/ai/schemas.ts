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
  heroSection: z.object({
    netProfitPerDeliveredOrder: z.number().describe("True net profit per delivered order"),
    fiveDayRevenue: z.number().describe("Estimated 5-day total revenue"),
    fiveDayNetProfit: z.number().describe("Estimated 5-day net profit"),
    returnRate: z.number().describe("Return rate percentage"),
    confirmationRate: z.number().describe("Call center confirmation rate percentage"),
    realRoas: z.number().describe("Real ROAS: collected revenue divided by ad spend"),
    stockRemainingEstimate: z.number().describe("Stock remaining estimation count"),
  }),
  criticalAlerts: z.array(
    z.object({
      severity: z.enum(["RED", "AMBER"]).describe("Alert urgency level"),
      finding: z.string().describe("Specific finding details including exact numbers"),
      action: z.string().describe("Specific action to take"),
    })
  ).describe("Critical campaign alerts"),
  executivePlWaterfall: z.object({
    revenue: z.number().describe("Selling price collected per delivered order"),
    cogs: z.number().describe("Cost of goods per delivered order"),
    internationalShipping: z.number().describe("International shipping cost per delivered order"),
    grossProfit: z.number().describe("Gross profit per delivered order"),
    codDeliveryFee: z.number().describe("Local COD delivery fee per delivered order"),
    returnCostAllocation: z.number().describe("Allocated cost of returned parcels per delivered order"),
    adSpendAllocation: z.number().describe("Allocated ad spend per delivered order"),
    netProfitPerOrder: z.number().describe("Net profit per delivered order"),
    percentages: z.object({
      revenuePercent: z.number(),
      cogsPercent: z.number(),
      internationalShippingPercent: z.number(),
      grossProfitPercent: z.number(),
      codDeliveryFeePercent: z.number(),
      returnCostAllocationPercent: z.number(),
      adSpendAllocationPercent: z.number(),
      netProfitPerOrderPercent: z.number(),
    }).describe("Percentage representation of each P&L line relative to revenue"),
  }),
  operationalFunnel: z.object({
    totalOrders: z.number().describe("Raw Facebook acquisitions / leads"),
    confirmedOrders: z.number().describe("Confirmed orders count"),
    confirmedRate: z.number().describe("Confirmation rate %"),
    shippedOrders: z.number().describe("Shipped orders count"),
    deliveredOrders: z.number().describe("Delivered orders count"),
    deliveryRate: z.number().describe("Delivery rate %"),
    returnedOrders: z.number().describe("Returned orders count"),
    returnRate: z.number().describe("Return rate %"),
  }),
  adPerformance: z.object({
    campaignHealthScore: z.number().int().min(0).max(100).describe("0-100 Campaign overall health score"),
    adSets: z.array(
      z.object({
        adSetName: z.string().describe("Ad set name"),
        spend: z.number().describe("Spend amount"),
        orders: z.number().describe("Acquisition leads"),
        cpp: z.number().describe("Cost per purchase (raw Facebook)"),
        roas: z.number().describe("Facebook ROAS"),
        status: z.enum(["SCALE", "OPTIMIZE", "PAUSE", "KILL"]).describe("Recommended status"),
        recommendation: z.string().describe("Specific recommendation details with exact numbers"),
      })
    ),
  }),
  businessIntelligence: z.object({
    breakEvenCpp: z.number().describe("Break-even Cost Per Purchase"),
    breakEvenCpa: z.number().describe("Break-even Cost Per Acquisition (Leads)"),
    maxAcceptableAdSpendPerOrder: z.number().describe("Max acceptable ad spend per delivered order"),
    projectedMonthlyProfitCurrent: z.number().describe("Projected monthly profit at current rate"),
    projectedMonthlyProfitOptimized: z.number().describe("Projected monthly profit if optimized"),
  }),
  actionPlan: z.object({
    priority1: z.array(z.string()).describe("High priority items to execute today"),
    priority2: z.array(z.string()).describe("Medium priority items to execute this week"),
    priority3: z.array(z.string()).describe("Items to monitor closely"),
    overallDecision: z.enum(["SCALE", "OPTIMIZE", "RETEST", "KILL"]).describe("Final decision"),
    reasoning: z.string().describe("Detailed reasoning backing overall decision"),
  }),
});

export type AdvertisingAnalysisAiResult = z.infer<typeof advertisingAnalysisSchema>;

