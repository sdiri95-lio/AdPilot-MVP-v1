import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { AdIntelligenceClient } from "@/components/projects/AdIntelligenceClient";

export default async function AdIntelligencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const { id: projectId } = await params;

  // 1. Fetch project with basic validations
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) notFound();

  // 2. Fetch all historical advertising analyses for this project, sorted by most recent
  const analyses = await prisma.advertisingAnalysis.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      csvUpload: {
        include: { mediaBuyingTest: true },
      },
    },
  });

  // 3. Serialize prisma decimals and dates to clean plain JSON objects for the Client Component
  const serializedProject = {
    id: project.id,
    productName: project.productName,
    sellingPrice: project.sellingPrice.toNumber(),
    productCost: project.productCost.toNumber(),
    targetCountry: project.targetCountry || "African General",
  };

  const serializedAnalyses = analyses.map((a) => ({
    id: a.id,
    projectId: a.projectId,
    csvUploadId: a.csvUploadId,
    campaignHealthScore: a.campaignHealthScore,
    overallDecision: a.overallDecision,
    confidenceScore: a.confidenceScore,
    creativeRanking: a.creativeRanking,
    winningAdSets: a.winningAdSets,
    losingAdSets: a.losingAdSets,
    fatigueWarnings: a.fatigueWarnings,
    businessIntel: a.businessIntel,
    optimizationActions: a.optimizationActions,
    actionPlan: a.actionPlan,
    createdAt: a.createdAt.toISOString(),
    csvUpload: a.csvUpload
      ? {
          id: a.csvUpload.id,
          createdAt: a.csvUpload.createdAt.toISOString(),
          mediaBuyingTest: a.csvUpload.mediaBuyingTest
            ? {
                id: a.csvUpload.mediaBuyingTest.id,
                country: a.csvUpload.mediaBuyingTest.country,
                offer: a.csvUpload.mediaBuyingTest.offer,
              }
            : null,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Ad Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Autonomous Facebook campaign audit combined with logistics & COD profitability mapping.
        </p>
      </div>

      <AdIntelligenceClient
        project={serializedProject}
        analyses={serializedAnalyses}
      />
    </div>
  );
}
