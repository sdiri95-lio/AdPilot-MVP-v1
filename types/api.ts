import type { ProjectResponse } from "@/lib/validators";
import type { SubscriptionTier } from "@/types";

export type ProjectsListResponse = {
  projects: ProjectResponse[];
  usage: {
    activeProjectCount: number;
    projectLimit: number;
    subscription: SubscriptionTier;
  };
};

export type ProjectDetailResponse = {
  project: ProjectResponse;
};

export type ApiErrorResponse = {
  message: string;
  errors?: unknown;
};

export type ProjectImageUploadResponse = {
  imageUrl: string;
  path: string;
};

export type ProductAnalysisResponse = {
  id: string;
  projectId: string;
  model: string;
  analysisVersion: string;
  category: string | null;
  demand: string | null;
  competition: string | null;
  emotionalTriggers: string[] | null;
  difficultyScore: number | null;
  marketOpportunity: number | null;
  riskScore: string | null;
  marketScore: number | null;
  productScore: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  targetAudience: string[] | null;
  pricingRecommendations: string[] | null;
  risks: string[] | null;
  mediaBuyerReport: {
    summary: string;
    recommendation: string;
    strengths: string[];
    weaknesses: string[];
    nextActions: string[];
  } | null;
  opportunityScoreInputs: {
    productScore: number | null;
    marketScore: number | null;
    riskScore: string | null;
    difficultyScore: number | null;
    marketOpportunity: number | null;
  } | null;
  createdAt: string;
};

export type AnalyzeProductResponse = {
  analysis: ProductAnalysisResponse;
  project: ProjectResponse;
};

export type WinningProbabilityAnalysisResponse = {
  id: string;
  projectId: string;
  model: string;
  analysisVersion: string;
  winningProbability: number;
  confidenceScore: number;
  reasoning: string[];
  recommendation: string;
  createdAt: string;
};

export type AnalyzeWinningProbabilityResponse = {
  analysis: WinningProbabilityAnalysisResponse;
  project: ProjectResponse;
};

export type ProfitAnalysisResponse = {
  id: string;
  projectId: string;
  model: string;
  analysisVersion: string;
  revenue: number;
  margin: number;
  marginPercent: number;
  breakEvenCpl: number;
  breakEvenCpa: number;
  targetCpl: number;
  targetCpa: number;
  minCpl: number;
  recommendedCpl: number;
  maxCpl: number;
  assumptions: string[];
  createdAt: string;
};

export type AnalyzeProfitResponse = {
  analysis: ProfitAnalysisResponse;
  project: ProjectResponse;
};
