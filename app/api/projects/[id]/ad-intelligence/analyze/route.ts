import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AIGateway } from "@/lib/ai/gateway";
import { advertisingIntelligencePrompt } from "@/prompts/advertising-intelligence";
import { advertisingIntelligenceAiSchema } from "@/lib/ai/schemas";
import { Prisma } from "@prisma/client";

const gateway = new AIGateway();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Guard
    const user = await requireCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: projectId } = await params;

    // 2. Project Ownership Check
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // 3. Find the latest analyzed CSV upload for this project
    const latestUpload = await prisma.csvUpload.findFirst({
      where: { projectId, status: "ANALYZED" },
      orderBy: { createdAt: "desc" },
      include: { mediaBuyingTest: true },
    });

    if (!latestUpload || !latestUpload.parsedData) {
      return NextResponse.json(
        { error: "No parsed Facebook CSV export found for this project. Please upload a CSV first." },
        { status: 400 }
      );
    }

    // 4. Extract COD Logistics Metrics from the media buying test (defaulting to project variables or standard fallbacks)
    const mbt = latestUpload.mediaBuyingTest;
    const targetCountry = project.targetCountry || "African General";
    const sellingPrice = project.sellingPrice.toNumber();
    const productCost = project.productCost.toNumber();
    
    const deliveryRate = mbt?.deliveryRate ? mbt.deliveryRate.toNumber() : 100.0;
    const confirmationRate = mbt?.confirmationRate ? mbt.confirmationRate.toNumber() : 100.0;
    const returnRate = mbt?.returnRate ? mbt.returnRate.toNumber() : 0.0;
    const shippingCost = mbt?.shippingCost ? mbt.shippingCost.toNumber() : 0.0;
    const returnFee = mbt?.returnFee ? mbt.returnFee.toNumber() : 0.0;

    const hierarchyJson = JSON.stringify(latestUpload.parsedData, null, 2);

    // 5. Generate prompt and call AIGateway
    const systemContext = `You are a senior dropshipping media buyer and logistics analyst. You must always return responses in strict JSON format.`;
    const userPrompt = advertisingIntelligencePrompt(
      project.productName,
      sellingPrice,
      productCost,
      targetCountry,
      deliveryRate,
      confirmationRate,
      returnRate,
      shippingCost,
      returnFee,
      hierarchyJson
    );

    const aiResult = await gateway.generate({
      userId: user.id,
      feature: "advertising-intelligence",
      systemPrompt: systemContext,
      userPrompt,
      schema: advertisingIntelligenceAiSchema,
    });

    // 6. Save the AI Analysis result in the database
    const analysis = await prisma.advertisingAnalysis.create({
      data: {
        projectId,
        csvUploadId: latestUpload.id,
        campaignHealthScore: aiResult.campaignHealthScore,
        overallDecision: aiResult.overallDecision,
        confidenceScore: aiResult.confidenceScore,
        creativeRanking: aiResult.creativeRanking as unknown as Prisma.InputJsonValue,
        winningAdSets: aiResult.winningAdSets as unknown as Prisma.InputJsonValue,
        losingAdSets: aiResult.losingAdSets as unknown as Prisma.InputJsonValue,
        fatigueWarnings: aiResult.fatigueWarnings as unknown as Prisma.InputJsonValue,
        businessIntel: aiResult.businessIntel as unknown as Prisma.InputJsonValue,
        optimizationActions: aiResult.optimizationActions as unknown as Prisma.InputJsonValue,
        actionPlan: aiResult.actionPlan as unknown as Prisma.InputJsonValue,
      },
    });

    // 7. Log timeline event
    const { logTimelineEvent } = await import("@/lib/timeline");
    await logTimelineEvent({
      projectId,
      eventType: "AI_ANALYSIS_COMPLETED",
      title: "AI Ad Intelligence Completed",
      description: `Recommendation: ${aiResult.overallDecision} (Health: ${aiResult.campaignHealthScore}/100) | Confidence: ${aiResult.confidenceScore}%`,
    });

    return NextResponse.json({ success: true, analysis });

  } catch (error: unknown) {
    console.error("Ad Intelligence API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
