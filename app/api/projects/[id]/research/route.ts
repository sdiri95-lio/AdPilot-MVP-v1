import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeUrl } from "@/lib/scraper";
import { AIGateway } from "@/lib/ai/gateway";
import { productResearchPrompt } from "@/prompts/product-research";
import { productResearchSchema } from "@/lib/ai/schemas";

const gateway = new AIGateway();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id: projectId } = await params;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const { productUrl } = body;

    if (!productUrl) {
      return NextResponse.json({ error: "Product URL is required" }, { status: 400 });
    }

    // 1. Scrape the URL
    console.log(`[Research Route] Scraping URL: ${productUrl}...`);
    const scrapedContent = await scrapeUrl(productUrl);

    // 2. Build system and user prompts
    const systemPrompt = `You are a senior dropshipping Product Researcher and logistics expert in African Cash-On-Delivery. You must always respond in strict JSON format.`;
    const userPrompt = productResearchPrompt(
      project.name,
      project.productName,
      project.productCost.toNumber(),
      project.sellingPrice.toNumber(),
      project.shippingCost.toNumber(),
      project.serviceFee.toNumber(),
      project.targetCountry,
      scrapedContent
    );

    // 3. Call AIGateway
    console.log("[Research Route] Hitting AI Gateway...");
    const aiResult = await gateway.generate({
      userId,
      feature: "product-research",
      systemPrompt,
      userPrompt,
      schema: productResearchSchema,
    });

    // 4. Update the project's productUrl
    await prisma.project.update({
      where: { id: projectId },
      data: { productUrl },
    });

    // 5. Save the analysis record
    const research = await prisma.productResearch.create({
      data: {
        projectId,
        productIntelligence: aiResult.productIntelligence,
        marketIntelligence: aiResult.marketIntelligence,
        customerProfile: aiResult.customerProfile,
        marketingArsenal: aiResult.marketingArsenal,
        countryAnalysis: aiResult.countryAnalysis,
        finalRecommendation: aiResult.finalRecommendation,
      },
    });

    return NextResponse.json({ success: true, research });
  } catch (error: unknown) {
    console.error("Product Research Route Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Fetch all research reports for this project
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

    const researches = await prisma.productResearch.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ researches });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
