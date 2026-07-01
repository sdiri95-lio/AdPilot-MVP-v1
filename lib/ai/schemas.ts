import { z } from "zod";
import {
  demandLevels,
  competitionLevels,
  riskScores,
  mediaBuyerReportSchema,
} from "@/lib/validators";

export const productAnalyzerAiSchema = z.object({
  category: z.string().describe("The product category or niche."),
  demand: z.enum(demandLevels).describe("Overall market demand level."),
  competition: z.enum(competitionLevels).describe("Overall market competition level."),
  emotionalTriggers: z.array(z.string()).describe("List of emotional triggers for marketing."),
  difficultyScore: z.number().int().min(1).max(10).describe("1-10 difficulty score to sell this product."),
  marketOpportunity: z.number().int().min(1).max(10).describe("1-10 market opportunity score."),
  riskScore: z.enum(riskScores).describe("Overall risk score."),
  marketScore: z.number().int().min(1).max(10).describe("1-10 market score."),
  productScore: z.number().int().min(1).max(10).describe("1-10 product score."),
  mediaBuyerReport: mediaBuyerReportSchema.describe("A structured report from the perspective of a senior media buyer."),
  targetAudience: z.array(z.string()).describe("List of target audience segments (demographics, interests, behaviours)."),
  pricingRecommendations: z.array(z.string()).describe("List of actionable pricing strategy recommendations."),
  risks: z.array(z.string()).describe("List of key risks associated with selling this product."),
});

export type ProductAnalyzerAiResult = z.infer<typeof productAnalyzerAiSchema>;

export const opportunityScoreAiSchema = z.object({
  winningProbability: z.number().int().min(0).max(100).describe("0-100 probability of this product being a winning product."),
  confidenceScore: z.number().int().min(0).max(100).describe("0-100 confidence level in the probability estimation."),
  reasoning: z.array(z.string().min(1)).min(2).describe("List of key factors influencing the scores. Must contain at least 2 items."),
  recommendation: z.enum(["TEST", "SKIP", "MONITOR"]).describe("Clear actionable recommendation based on the score."),
});

export type OpportunityScoreAiResult = z.infer<typeof opportunityScoreAiSchema>;

export const testStrategyAiSchema = z.object({
  scenario: z.enum(["MINIMUM", "BEST", "HIGH"]).describe("The test scenario type."),
  campaignType: z.enum(["ABO", "CBO"]).describe("Recommended campaign structure."),
  adsetCount: z.number().int().min(1).describe("Number of recommended adsets."),
  budgetPerAdset: z.number().min(0).describe("Budget allocated per adset."),
  totalBudget: z.number().min(0).describe("Total testing budget."),
  targetingType: z.enum(["TARGET", "BROAD"]).describe("Recommended targeting approach."),
  targetingDetails: z.record(z.any()).describe("Specific targeting configuration details (e.g. interests, age, locations)."),
  expectedSpend: z.number().min(0).describe("Expected spend during the test phase."),
  expectedLeads: z.number().int().min(0).describe("Expected number of leads or clicks."),
  expectedOrders: z.number().int().min(0).describe("Expected number of purchases/orders."),
  expectedRisk: z.enum(riskScores).describe("Risk associated with this test strategy."),
});

export type TestStrategyAiResult = z.infer<typeof testStrategyAiSchema>;

export const copyGeneratorAiSchema = z.object({
  hooks: z.array(z.string()).min(3).describe("At least 3 hook variations for the ad."),
  headlines: z.array(z.string()).min(3).describe("At least 3 headline variations."),
  primaryTexts: z.array(z.string()).min(2).describe("At least 2 primary text body variations."),
  ctaVariations: z.array(z.string()).min(2).describe("At least 2 call to action variations."),
});

export type CopyGeneratorAiResult = z.infer<typeof copyGeneratorAiSchema>;

export const profitCalculatorAiSchema = z.object({
  assumptions: z.array(z.string().min(1)).min(2).describe("List of realistic assumptions and caveats about these profit margins and costs based on the African e-commerce market context."),
});

export type ProfitCalculatorAiResult = z.infer<typeof profitCalculatorAiSchema>;

export const testDecisionAiSchema = z.object({
  decision: z.enum(["RETEST", "SCALE", "KILL", "IMPORT"]).describe("The macro decision for this media buying test."),
  confidenceScore: z.number().int().min(0).max(100).describe("0-100 confidence level in the decision."),
  reasoning: z.string().describe("Detailed reasoning explaining why this decision was made, analyzing CTR, CPP, Delivery, and Profit."),
  nextAction: z.string().describe("Clear, exact next operational step (e.g. 'Launch Libya test using Offer B')."),
});

export type TestDecisionAiResult = z.infer<typeof testDecisionAiSchema>;

export const importExplanationAiSchema = z.object({
  explanation: z.string().describe("Clear explanation of why the deterministic Import Readiness Score was given."),
  strengths: z.array(z.string()).min(1).describe("Key strengths of this product's import viability."),
  weaknesses: z.array(z.string()).min(1).describe("Key weaknesses or vulnerabilities."),
  risks: z.array(z.string()).min(1).describe("Specific operational or capital risks."),
  recommendedActions: z.array(z.string()).min(1).describe("Actionable next steps based on the score and data."),
});

export type ImportExplanationAiResult = z.infer<typeof importExplanationAiSchema>;

export const advertisingIntelligenceAiSchema = z.object({
  campaignHealthScore: z.number().int().min(0).max(100).describe("0-100 overall score of campaign health."),
  overallDecision: z.enum(["SCALE", "OPTIMIZE", "RETEST", "KILL"]).describe("The macro scaling/optimization decision."),
  confidenceScore: z.number().int().min(0).max(100).describe("0-100 confidence score in the AI analysis."),
  
  creativeRanking: z.array(z.object({
    adName: z.string().describe("The name of the ad creative."),
    rank: z.number().int().min(1).describe("Performance rank (1 being best)."),
    status: z.enum(["WINNER", "AVERAGE", "LOSER"]).describe("Performance classification."),
    ctr: z.number().describe("CTR (all) in %."),
    spend: z.number().describe("Amount spent on this ad."),
    orders: z.number().describe("Number of orders generated."),
    insights: z.string().describe("AI insights explaining its performance.")
  })).describe("Creative performance rankings and analysis."),

  winningAdSets: z.array(z.object({
    adSetName: z.string().describe("Name of the ad set."),
    spend: z.number().describe("Amount spent."),
    orders: z.number().describe("Orders generated."),
    cpp: z.number().describe("Cost per purchase."),
    roas: z.number().describe("Standard Facebook ROAS."),
    scalingPotential: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Scaling potential rating."),
    reason: z.string().describe("Why this ad set is considered a winner.")
  })).describe("Successful ad sets recommended for scaling."),

  losingAdSets: z.array(z.object({
    adSetName: z.string().describe("Name of the ad set."),
    spend: z.number().describe("Amount spent."),
    orders: z.number().describe("Orders generated."),
    cpp: z.number().describe("Cost per purchase."),
    roas: z.number().describe("Standard Facebook ROAS."),
    issue: z.string().describe("Primary bottleneck identified (e.g. high CPM, low CTR)."),
    recommendation: z.string().describe("Recommended corrective action (e.g. pause, replace creatives).")
  })).describe("Underperforming ad sets needing optimization."),

  fatigueWarnings: z.array(z.object({
    targetName: z.string().describe("Campaign, Ad Set, or Ad Name."),
    frequency: z.number().describe("Frequency value."),
    warningType: z.enum(["HIGH_FREQUENCY", "CPM_SPIKE", "ROAS_DROP"]).describe("Type of warning."),
    remedy: z.string().describe("Actionable fix to resolve fatigue.")
  })).describe("Audience and creative wear-out alerts."),

  businessIntel: z.object({
    trueProfit: z.number().describe("Calculated true profit after COD adjustments."),
    netMargin: z.number().describe("Net margin percentage."),
    breakEvenCpa: z.number().describe("Break-even CPA."),
    breakEvenCpp: z.number().describe("Break-even CPP."),
    maxAcceptableCpc: z.number().describe("Maximum CPC threshold."),
    maxAcceptableCpm: z.number().describe("Maximum CPM threshold."),
    projectedMonthlyProfit: z.number().describe("Projected monthly profit based on current run rate."),
    cashFlow: z.string().describe("Cashflow status analysis and constraints.")
  }).describe("Economics and cashflow indicators."),

  optimizationActions: z.array(z.object({
    action: z.string().describe("The exact action to perform (e.g., 'Pause Ad Set B')."),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Priority order."),
    rationale: z.string().describe("Detailed reasoning analyzing CTR, CPP, CPM, etc.")
  })).describe("Direct operational optimization rules."),

  actionPlan: z.object({
    immediate: z.array(z.string()).min(1).describe("Action items to execute today."),
    monitor: z.array(z.string()).min(1).describe("Metrics or targets to track over next 3-7 days."),
    scaling: z.array(z.string()).min(1).describe("Suggested horizontal/vertical scaling steps."),
    risk: z.array(z.string()).min(1).describe("Operational/capital risk flags to manage."),
    nextBudget: z.number().describe("Recommended daily budget for next test phase.")
  }).describe("Strategic roadmap for next operational cycle.")
});

export type AdvertisingIntelligenceAiResult = z.infer<typeof advertisingIntelligenceAiSchema>;
