import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { AIGateway, AIFeature } from "@/lib/ai/gateway";
import {
  productAnalyzerAiSchema,
  opportunityScoreAiSchema,
  testStrategyAiSchema,
  copyGeneratorAiSchema,
  testDecisionAiSchema,
  importExplanationAiSchema,
} from "@/lib/ai/schemas";
import { systemContext } from "@/prompts/system-context";
import { productAnalyzerPrompt } from "@/prompts/product-analyzer";
import { winningProbabilityPrompt } from "@/prompts/winning-probability";
import { testStrategyPrompt } from "@/prompts/test-strategy";
import { adCopyPrompt } from "@/prompts/ad-copy";
import { testDecisionPrompt } from "@/prompts/test-decision";
import { importExplanationPrompt } from "@/prompts/import-explanation";
import { calculateProfitMetrics } from "@/lib/ai/profit-calculator";

const gateway = new AIGateway();

export async function POST(req: Request) {
  try {
    const user = await requireCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!user.usage || user.usage.aiCallsUsed >= user.usage.aiCallsLimit) {
      return new NextResponse("AI Usage Limit Exceeded", { status: 403 });
    }

    const body = await req.json();
    const { feature, data } = body;

    if (!feature) {
      return new NextResponse("Missing feature parameter", { status: 400 });
    }

    if (feature === "profit-calculator") {
      const result = calculateProfitMetrics(data);
      return NextResponse.json(result);
    }

    let result;
    
    switch (feature as AIFeature) {
      case "product-analyzer":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: productAnalyzerPrompt(
            data.productName,
            data.productCost,
            data.sellingPrice,
            data.description
          ),
          schema: productAnalyzerAiSchema,
        });
        break;

      case "opportunity-score":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: winningProbabilityPrompt(
            data.productName,
            data.productScore,
            data.marketScore,
            data.riskScore
          ),
          schema: opportunityScoreAiSchema,
        });
        break;

      case "test-strategy":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: testStrategyPrompt(
            data.productName,
            data.category,
            data.budget
          ),
          schema: testStrategyAiSchema,
        });
        break;

      case "copy-generator":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: adCopyPrompt(
            data.productName,
            data.emotionalTriggers
          ),
          schema: copyGeneratorAiSchema,
        });
        break;

      case "test-decision":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: testDecisionPrompt(
            data.productName,
            data.country,
            data.spend,
            data.orders,
            data.roas,
            data.ctr,
            data.cpc,
            data.cpp,
            data.deliveryRate,
            data.trueProfit,
            data.timelineEvents || []
          ),
          schema: testDecisionAiSchema,
        });
        break;

      case "import-explanation":
        result = await gateway.generate({
          userId: user.id,
          feature,
          systemPrompt: systemContext,
          userPrompt: importExplanationPrompt(
            data.productName,
            data.importScore,
            data.decisionThreshold,
            data.moq,
            data.leadTime,
            data.capitalRequired,
            data.countriesWon,
            data.avgDeliveryRate,
            data.avgTrueProfit
          ),
          schema: importExplanationAiSchema,
        });
        break;

      default:
        return new NextResponse("Invalid feature", { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("AI Generate API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
