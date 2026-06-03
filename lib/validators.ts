import { z } from "zod";

export const projectStatuses = ["ACTIVE", "ARCHIVED"] as const;
export const productTypes = [
  "IMPULSE",
  "PROBLEM_SOLVER",
  "TRENDING",
  "UTILITY",
  "SEASONAL",
] as const;

export const demandLevels = ["HIGH", "MEDIUM", "LOW"] as const;
export const competitionLevels = ["HIGH", "MEDIUM", "LOW"] as const;
export const riskScores = ["LOW", "MEDIUM", "HIGH"] as const;
export const imageContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxProjectImageSize = 5 * 1024 * 1024;

const moneySchema = z.coerce.number().nonnegative();
const scoreSchema = z.coerce.number().min(0).max(100);
const oneToTenScoreSchema = z.coerce.number().int().min(1).max(10);

export const mediaBuyerReportSchema = z.object({
  summary: z.string().min(1),
  recommendation: z.string().min(1),
  strengths: z.array(z.string().min(1)).default([]),
  weaknesses: z.array(z.string().min(1)).default([]),
  nextActions: z.array(z.string().min(1)).default([]),
});

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(120),
  productName: z.string().min(1).max(120),
  productUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  country: z.string().min(2).max(80).optional(),
  targetCountry: z.string().min(2).max(80).optional(),
  productType: z.enum(productTypes).optional(),
  productCost: moneySchema,
  sellingPrice: moneySchema,
  shippingCost: moneySchema.default(0),
  serviceFee: moneySchema.default(0),
  desiredProfit: z.coerce.number().min(0).max(100),
});

export const projectUpdateSchema = projectCreateSchema
  .partial()
  .extend({
    status: z.enum(projectStatuses).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one project field is required.",
  });

export const projectAnalysisSchema = z.object({
  category: z.string().min(1).max(80).optional(),
  demand: z.enum(demandLevels).optional(),
  competition: z.enum(competitionLevels).optional(),
  emotionalTriggers: z.array(z.string().min(1)).optional(),
  difficultyScore: oneToTenScoreSchema.optional(),
  marketOpportunity: oneToTenScoreSchema.optional(),
  winningProbability: scoreSchema.optional(),
  confidenceScore: scoreSchema.optional(),
  opportunityReasoning: z.array(z.string().min(1)).optional(),
  opportunityRecommendation: z.string().optional(),
  profitAssumptions: z.array(z.string().min(1)).optional(),
  analysisVersion: z.string().min(1).default("v1"),
  mediaBuyerReport: mediaBuyerReportSchema.optional(),
  riskScore: z.enum(riskScores).optional(),
  marketScore: oneToTenScoreSchema.optional(),
  productScore: oneToTenScoreSchema.optional(),
  revenue: moneySchema.optional(),
  margin: moneySchema.optional(),
  marginPercent: scoreSchema.optional(),
  breakEvenCpl: moneySchema.optional(),
  breakEvenCpa: moneySchema.optional(),
  targetCpl: moneySchema.optional(),
  targetCpa: moneySchema.optional(),
  minCpl: moneySchema.optional(),
  recommendedCpl: moneySchema.optional(),
  maxCpl: moneySchema.optional(),
});

export const projectResponseSchema = projectCreateSchema
  .merge(projectAnalysisSchema)
  .extend({
    id: z.string().cuid(),
    userId: z.string().cuid(),
    status: z.enum(projectStatuses),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });

export const analyzeProductRequestSchema = z.object({
  description: z.string().max(500).optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectAnalysisInput = z.infer<typeof projectAnalysisSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
export type AnalyzeProductRequest = z.infer<typeof analyzeProductRequestSchema>;
