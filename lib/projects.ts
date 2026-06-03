import type { Prisma, Project } from "@prisma/client";

export function serializeProject(project: Project) {
  return {
    ...project,
    productCost: project.productCost.toNumber(),
    sellingPrice: project.sellingPrice.toNumber(),
    shippingCost: project.shippingCost.toNumber(),
    serviceFee: project.serviceFee.toNumber(),
    desiredProfit: project.desiredProfit.toNumber(),
    winningProbability: project.winningProbability?.toNumber() ?? null,
    confidenceScore: project.confidenceScore?.toNumber() ?? null,
    opportunityReasoning: project.opportunityReasoning as string[] | null,
    opportunityRecommendation: project.opportunityRecommendation ?? null,
    profitAssumptions: project.profitAssumptions as string[] | null,
    revenue: project.revenue?.toNumber() ?? null,
    margin: project.margin?.toNumber() ?? null,
    marginPercent: project.marginPercent?.toNumber() ?? null,
    breakEvenCpl: project.breakEvenCpl?.toNumber() ?? null,
    breakEvenCpa: project.breakEvenCpa?.toNumber() ?? null,
    targetCpl: project.targetCpl?.toNumber() ?? null,
    targetCpa: project.targetCpa?.toNumber() ?? null,
    minCpl: project.minCpl?.toNumber() ?? null,
    recommendedCpl: project.recommendedCpl?.toNumber() ?? null,
    maxCpl: project.maxCpl?.toNumber() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function projectWriteData(
  input: {
    name?: string;
    productName?: string;
    productUrl?: string;
    imageUrl?: string;
    country?: string;
    targetCountry?: string;
    productType?: Prisma.ProjectCreateInput["productType"];
    productCost?: number;
    sellingPrice?: number;
    shippingCost?: number;
    serviceFee?: number;
    desiredProfit?: number;
    status?: Prisma.ProjectCreateInput["status"];
  },
) {
  return {
    name: input.name,
    productName: input.productName,
    productUrl: input.productUrl,
    imageUrl: input.imageUrl,
    country: input.country,
    targetCountry: input.targetCountry,
    productType: input.productType,
    productCost: input.productCost,
    sellingPrice: input.sellingPrice,
    shippingCost: input.shippingCost,
    serviceFee: input.serviceFee,
    desiredProfit: input.desiredProfit,
    status: input.status,
  };
}
