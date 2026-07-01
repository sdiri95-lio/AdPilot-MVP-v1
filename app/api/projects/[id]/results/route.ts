import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { detectColumns, mapRow } from "@/lib/csv/column-mapper";
import { buildHierarchy, ParsedAdSet } from "@/lib/csv/parser";
import { AIGateway } from "@/lib/ai/gateway";
import { advertisingIntelligencePrompt } from "@/prompts/advertising-intelligence";
import { advertisingIntelligenceAiSchema } from "@/lib/ai/schemas";

const gateway = new AIGateway();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const uploads = await prisma.csvUpload.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { mediaBuyingTest: true },
  });

  return NextResponse.json({ uploads });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const { mediaBuyingTestId, rawData } = body;

  let mbt = null;
  if (mediaBuyingTestId) {
    mbt = await prisma.mediaBuyingTest.findUnique({ where: { id: mediaBuyingTestId } });
  }

  // 1. Process raw data using the new Column Mapper
  let spend = 0, orders = 0, impressions = 0, clicks = 0;
  const creativeMap = new Map<string, { spend: number, orders: number, impressions: number, clicks: number }>();
  const parsedRows: ParsedAdSet[] = [];

  const toFloat = (val: string | null | undefined): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[$,%\s]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const INACTIVE_STATUS = new Set([
    "off", "paused", "deleted", "inactive", "archived", "disapproved", "with issues", "not delivering", "scheduled", "draft"
  ]);

  if (Array.isArray(rawData) && rawData.length > 0) {
    const rawHeaders = Object.keys(rawData[0]);
    const detected = detectColumns(rawHeaders);

    rawData.forEach((row: Record<string, string>) => {
      const mapped = mapRow(row, detected);
      
      const rSpend = toFloat(mapped["amount_spent"]);
      const rStatus = (mapped["status"] ?? "").toLowerCase().trim();

      // Skip inactive or zero spend rows
      if (rSpend === 0 || (rStatus && INACTIVE_STATUS.has(rStatus))) {
        return;
      }

      const rOrders = toFloat(mapped["results"]);
      const rImpressions = toFloat(mapped["impressions"]);
      const rClicks = toFloat(mapped["link_clicks"]);

      spend += rSpend;
      orders += rOrders;
      impressions += rImpressions;
      clicks += rClicks;

      // Extract details for the hierarchy rows array
      parsedRows.push({
        ad_set_name: mapped["ad_set_name"] ?? null,
        campaign_name: mapped["campaign_name"] ?? null,
        ad_name: mapped["ad_name"] ?? null,
        status: mapped["status"] ?? null,
        amount_spent: rSpend,
        budget: mapped["budget"] !== null ? toFloat(mapped["budget"]) : null,
        budget_type: mapped["budget_type"] ?? null,
        impressions: rImpressions,
        cpm: toFloat(mapped["cpm"]),
        reach: toFloat(mapped["reach"]),
        frequency: toFloat(mapped["frequency"]),
        ctr: toFloat(mapped["ctr"]),
        link_clicks: rClicks,
        cpc: toFloat(mapped["cpc"]),
        purchase_roas: toFloat(mapped["purchase_roas"]),
        results: rOrders,
        result_type: mapped["result_type"] ?? null,
        cost_per_result: toFloat(mapped["cost_per_result"]),
        date_start: mapped["date_start"] ?? null,
        date_end: mapped["date_end"] ?? null,
      });

      // Track creatives under creativeMap
      const adName = mapped["ad_name"] || mapped["ad_set_name"] || "Unknown Creative";
      if (!creativeMap.has(adName)) {
        creativeMap.set(adName, { spend: 0, orders: 0, impressions: 0, clicks: 0 });
      }
      const c = creativeMap.get(adName)!;
      c.spend += rSpend;
      c.orders += rOrders;
      c.impressions += rImpressions;
      c.clicks += rClicks;
    });
  }

  // 2. Build the Campaign -> Ad Set -> Ad hierarchy JSON
  const parsedHierarchy = buildHierarchy(parsedRows);

  const targetCountry = project.targetCountry || "African General";
  const sellingPrice = project.sellingPrice.toNumber() || 0;
  const productCost = project.productCost.toNumber() || 0;
  
  // V1.1 COD Metrics
  const deliveryRate = mbt?.deliveryRate ? mbt.deliveryRate.toNumber() / 100 : 1;
  const confirmationRate = mbt?.confirmationRate ? mbt.confirmationRate.toNumber() / 100 : 1;
  const returnRate = mbt?.returnRate ? mbt.returnRate.toNumber() / 100 : 0;
  const returnFee = mbt?.returnFee ? mbt.returnFee.toNumber() : 0;
  const shippingCost = mbt?.shippingCost ? mbt.shippingCost.toNumber() : 0;
  
  // True Profit Calculation
  const actualOrders = orders * confirmationRate * deliveryRate;
  const returnedOrders = orders * confirmationRate * returnRate;
  
  const revenue = actualOrders * sellingPrice;
  const profit = revenue - spend - (actualOrders * productCost) - (actualOrders * shippingCost) - (returnedOrders * returnFee);
  
  const roas = spend > 0 ? (orders * sellingPrice) / spend : 0; // Standard FB ROAS
  const cpp = orders > 0 ? spend / orders : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;

  const kpiSummary = {
    spend,
    orders,
    revenue,
    profit,
    roas,
    cpp,
    cpm,
    ctr,
    cpc
  };

  // Save the upload containing the structured hierarchy JSON in parsedData
  const upload = await prisma.csvUpload.create({
    data: {
      projectId: id,
      mediaBuyingTestId,
      fileUrl: "local-upload",
      status: "ANALYZED",
      parsedData: parsedHierarchy as unknown as Prisma.InputJsonValue, // Storing CampaignNode[] tree structure
      kpiSummary,
    },
    include: { mediaBuyingTest: true },
  });
  
  // Save creatives if we have a test attached
  if (mediaBuyingTestId) {
    const creativeCreates = Array.from(creativeMap.entries()).map(([name, data]) => {
      const cRev = (data.orders * deliveryRate) * sellingPrice;
      return {
        mediaBuyingTestId,
        name,
        spend: data.spend,
        orders: data.orders,
        revenue: cRev,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
        cpp: data.orders > 0 ? data.spend / data.orders : 0,
        roas: data.spend > 0 ? (data.orders * sellingPrice) / data.spend : 0,
      };
    });
    
    if (creativeCreates.length > 0) {
       await prisma.creativeTest.createMany({
         data: creativeCreates
       });
    }
  }

  // V1.1 Timeline Event for raw CSV upload
  const { logTimelineEvent } = await import("@/lib/timeline");
  await logTimelineEvent({
    projectId: id,
    eventType: "CSV_UPLOADED",
    title: "CSV Results Uploaded",
    description: `Spend: $${spend.toFixed(2)} | Orders: ${orders} | Profit: $${profit.toFixed(2)}`,
  });

  // 3. Automatically trigger AI Ad Intelligence Analysis (Non-fatal if it fails)
  try {
    const hierarchyJson = JSON.stringify(parsedHierarchy, null, 2);
    const systemContext = `You are a senior dropshipping media buyer and logistics analyst. You must always return responses in strict JSON format.`;
    const userPrompt = advertisingIntelligencePrompt(
      project.productName,
      sellingPrice,
      productCost,
      targetCountry,
      deliveryRate * 100, // Pass as percent e.g., 65.0
      confirmationRate * 100,
      returnRate * 100,
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

    await prisma.advertisingAnalysis.create({
      data: {
        projectId: id,
        csvUploadId: upload.id,
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

    // Timeline event for AI analysis completion
    await logTimelineEvent({
      projectId: id,
      eventType: "AI_ANALYSIS_COMPLETED",
      title: "AI Ad Intelligence Completed",
      description: `Recommendation: ${aiResult.overallDecision} (Health: ${aiResult.campaignHealthScore}/100) | Confidence: ${aiResult.confidenceScore}%`,
    });
  } catch (aiErr) {
    console.error("Auto-AI analysis failed on CSV upload:", aiErr);
  }

  return NextResponse.json({ upload });
}
