export type SubscriptionTier = "FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type ProductType =
  | "IMPULSE"
  | "PROBLEM_SOLVER"
  | "TRENDING"
  | "UTILITY"
  | "SEASONAL";

export type DemandLevel = "HIGH" | "MEDIUM" | "LOW";
export type CompetitionLevel = "HIGH" | "MEDIUM" | "LOW";
export type RiskScore = "LOW" | "MEDIUM" | "HIGH";

export type MediaBuyerReport = {
  summary: string;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  nextActions: string[];
};

export type ProjectCreateContract = {
  name: string;
  productName: string;
  productUrl?: string;
  imageUrl?: string;
  country?: string;
  targetCountry?: string;
  productType?: ProductType;
  productCost: number;
  sellingPrice: number;
  shippingCost?: number;
  serviceFee?: number;
  desiredProfit: number;
};

export type ProjectAnalysisContract = {
  category?: string;
  demand?: DemandLevel;
  competition?: CompetitionLevel;
  emotionalTriggers?: string[];
  difficultyScore?: number;
  marketOpportunity?: number;
  winningProbability?: number;
  confidenceScore?: number;
  analysisVersion: string;
  mediaBuyerReport?: MediaBuyerReport;
  riskScore?: RiskScore;
  marketScore?: number;
  productScore?: number;
};

export type ProjectResponseContract = ProjectCreateContract &
  ProjectAnalysisContract & {
    id: string;
    userId: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
  };
