import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectWorkspace, type Project } from "@/components/ProjectWorkspace";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in" as Route);
  }

  const { id } = await params;

  // Fetch project with all related objects
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      codMetrics: true,
      researches: { orderBy: { createdAt: "desc" } },
      analyses: {
        orderBy: { createdAt: "desc" },
        include: { csvUpload: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Serializing Decimals and Dates for Client Component
  const serializedProject = {
    id: project.id,
    name: project.name,
    productName: project.productName,
    productCost: project.productCost.toNumber(),
    sellingPrice: project.sellingPrice.toNumber(),
    shippingCost: project.shippingCost.toNumber(),
    serviceFee: project.serviceFee.toNumber(),
    targetCountry: project.targetCountry,
    productUrl: project.productUrl,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    codMetrics: project.codMetrics
      ? {
          id: project.codMetrics.id,
          confirmationRate: project.codMetrics.confirmationRate.toNumber(),
          deliveryRate: project.codMetrics.deliveryRate.toNumber(),
          returnRate: project.codMetrics.returnRate.toNumber(),
          shippingCost: project.codMetrics.shippingCost.toNumber(),
          returnFee: project.codMetrics.returnFee.toNumber(),
        }
      : null,
    researches: project.researches.map((r) => ({
      id: r.id,
      productIntelligence: r.productIntelligence as unknown,
      marketIntelligence: r.marketIntelligence as unknown,
      customerProfile: r.customerProfile as unknown,
      marketingArsenal: r.marketingArsenal as unknown,
      countryAnalysis: r.countryAnalysis as unknown,
      finalRecommendation: r.finalRecommendation as unknown,
      createdAt: r.createdAt.toISOString(),
    })),
    analyses: project.analyses.map((a) => ({
      id: a.id,
      csvUploadId: a.csvUploadId,
      campaignHealthScore: a.campaignHealthScore,
      overallDecision: a.overallDecision,
      confidenceScore: a.confidenceScore,
      businessIntel: a.businessIntel as unknown,
      creativeRanking: a.creativeRanking as unknown,
      winningAdSets: a.winningAdSets as unknown,
      losingAdSets: a.losingAdSets as unknown,
      fatigueWarnings: a.fatigueWarnings as unknown,
      optimizationActions: a.optimizationActions as unknown,
      actionPlan: a.actionPlan as unknown,
      createdAt: a.createdAt.toISOString(),
      csvUpload: a.csvUpload
        ? {
            id: a.csvUpload.id,
            kpiSummary: a.csvUpload.kpiSummary as unknown,
            createdAt: a.csvUpload.createdAt.toISOString(),
          }
        : null,
    })),
  };

  return <ProjectWorkspace project={serializedProject as unknown as Project} />;
}
