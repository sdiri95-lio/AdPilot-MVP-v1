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
    productVideos: project.productVideos ?? null,
    supplierLink: project.supplierLink ?? null,
    weight: project.weight?.toNumber() ?? null,
    adLibraryLinks: project.adLibraryLinks ?? null,
    competitorLinks: project.competitorLinks ?? null,
    notes: project.notes ?? null,
    solvesProblem: project.solvesProblem ?? false,
    dailyUse: project.dailyUse ?? false,
    easyToDemonstrate: project.easyToDemonstrate ?? false,
    viralPotential: project.viralPotential ?? false,
    goodMargin: project.goodMargin ?? false,
    lightweight: project.lightweight ?? false,
    codFriendly: project.codFriendly ?? false,
    sustainableDemand: project.sustainableDemand ?? false,
    researchScore: project.researchScore ?? null,
    researchStatus: project.researchStatus ?? "RESEARCHING",
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function projectWriteData(
  input: Partial<{
    name: string;
    productName: string;
    productUrl: string;
    imageUrl: string;
    country: string;
    targetCountry: string;
    productType: Prisma.ProjectCreateInput["productType"];
    productCost: number;
    sellingPrice: number;
    shippingCost: number;
    serviceFee: number;
    desiredProfit: number;
    status: Prisma.ProjectCreateInput["status"];
    productVideos: unknown;
    supplierLink: string | null;
    weight: number | null;
    adLibraryLinks: unknown;
    competitorLinks: unknown;
    notes: string | null;
    solvesProblem: boolean;
    dailyUse: boolean;
    easyToDemonstrate: boolean;
    viralPotential: boolean;
    goodMargin: boolean;
    lightweight: boolean;
    codFriendly: boolean;
    sustainableDemand: boolean;
    researchScore: number | null;
    researchStatus: "RESEARCHING" | "READY_FOR_TEST" | "REJECTED" | "WINNER";
  }>
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
    productVideos: input.productVideos ?? undefined,
    supplierLink: input.supplierLink,
    weight: input.weight,
    adLibraryLinks: input.adLibraryLinks ?? undefined,
    competitorLinks: input.competitorLinks ?? undefined,
    notes: input.notes,
    solvesProblem: input.solvesProblem,
    dailyUse: input.dailyUse,
    easyToDemonstrate: input.easyToDemonstrate,
    viralPotential: input.viralPotential,
    goodMargin: input.goodMargin,
    lightweight: input.lightweight,
    codFriendly: input.codFriendly,
    sustainableDemand: input.sustainableDemand,
    researchScore: input.researchScore,
    researchStatus: input.researchStatus,
  };
}
