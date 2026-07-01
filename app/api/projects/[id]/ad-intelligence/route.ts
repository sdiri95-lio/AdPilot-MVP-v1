import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFacebookCsv, buildHierarchy } from "@/lib/csv/parser";
import { AIGateway } from "@/lib/ai/gateway";
import { advertisingIntelligencePrompt } from "@/prompts/advertising-intelligence";
import { advertisingAnalysisSchema } from "@/lib/ai/schemas";
import { Prisma } from "@prisma/client";

const gateway = new AIGateway();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id: projectId } = await params;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { codMetrics: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large (max 10MB)" }, { status: 400 });
    }

    const csvText = await file.text();
    if (!csvText.trim()) {
      return NextResponse.json({ error: "Uploaded CSV file is empty" }, { status: 400 });
    }

    // 1. Run the CSV Parser
    console.log("[Ad Intelligence API] Parsing Facebook CSV...");
    const parseResult = parseFacebookCsv(csvText);

    // 2. Build the tree hierarchy
    console.log("[Ad Intelligence API] Building campaign tree hierarchy...");
    const hierarchy = buildHierarchy(parseResult.rows);

    // 3. Aggregate top-level KPIs (Spend, Orders, Impressions, Clicks)
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalOrders = 0;

    parseResult.rows.forEach(r => {
      totalSpend += r.amount_spent;
      totalImpressions += r.impressions;
      totalClicks += r.link_clicks;
      totalOrders += r.results;
    });

    // 4. Retrieve COD Logistics Metrics (use defaults if none exist)
    const metrics = project.codMetrics || {
      confirmationRate: new Prisma.Decimal(100.0),
      deliveryRate: new Prisma.Decimal(100.0),
      returnRate: new Prisma.Decimal(0.0),
      shippingCost: new Prisma.Decimal(0.0),
      returnFee: new Prisma.Decimal(0.0),
    };

    const confPercent = metrics.confirmationRate.toNumber();
    const delivPercent = metrics.deliveryRate.toNumber();
    const retPercent = metrics.returnRate.toNumber();
    const shipCost = metrics.shippingCost.toNumber();
    const retFee = metrics.returnFee.toNumber();

    // Outbound shipping cost from metrics or fallback to project config
    const codShippingCost = shipCost || project.shippingCost.toNumber();

    // 5. Trigger AI Campaign Audit
    console.log("[Ad Intelligence API] Hitting AI Gateway...");
    const systemPrompt = `You are a senior dropshipping media buyer and logistics analyst. You must always return responses in strict JSON format matching the schema exactly.`;
    const userPrompt = advertisingIntelligencePrompt(
      project.name,
      project.productName,
      project.productCost.toNumber(),
      project.sellingPrice.toNumber(),
      project.shippingCost.toNumber(),
      project.serviceFee.toNumber(),
      project.targetCountry,
      confPercent,
      delivPercent,
      retPercent,
      codShippingCost,
      retFee,
      JSON.stringify(hierarchy, null, 2)
    );

    const aiResult = await gateway.generate({
      userId,
      feature: "advertising-analysis",
      systemPrompt,
      userPrompt,
      schema: advertisingAnalysisSchema,
    });

    // 6. Save CsvUpload record
    const kpiSummary = {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      orders: totalOrders,
      cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      cpp: totalOrders > 0 ? totalSpend / totalOrders : 0,
    };

    console.log("[Ad Intelligence API] Saving CsvUpload and AdvertisingAnalysis...");
    const upload = await prisma.csvUpload.create({
      data: {
        projectId,
        parsedData: hierarchy as unknown as Prisma.InputJsonValue,
        kpiSummary: kpiSummary as unknown as Prisma.InputJsonValue,
      },
    });

    // 7. Save AdvertisingAnalysis record mapping new properties to JSON columns
    const analysis = await prisma.advertisingAnalysis.create({
      data: {
        projectId,
        csvUploadId: upload.id,
        campaignHealthScore: aiResult.adPerformance.campaignHealthScore,
        overallDecision: aiResult.actionPlan.overallDecision,
        confidenceScore: 100,
        businessIntel: aiResult.businessIntelligence as unknown as Prisma.InputJsonValue,
        creativeRanking: aiResult.heroSection as unknown as Prisma.InputJsonValue,
        winningAdSets: aiResult.adPerformance.adSets as unknown as Prisma.InputJsonValue,
        losingAdSets: aiResult.operationalFunnel as unknown as Prisma.InputJsonValue,
        fatigueWarnings: aiResult.criticalAlerts as unknown as Prisma.InputJsonValue,
        optimizationActions: aiResult.executivePlWaterfall as unknown as Prisma.InputJsonValue,
        actionPlan: aiResult.actionPlan as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, upload, analysis });
  } catch (error: unknown) {
    console.error("Ad Intelligence Route Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Fetch all analyses for this project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id: projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const analyses = await prisma.advertisingAnalysis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { csvUpload: true },
    });

    return NextResponse.json({ analyses });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
