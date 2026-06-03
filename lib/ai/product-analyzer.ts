import type { ProductAnalysis } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AIGateway } from "@/lib/ai/gateway";
import { productAnalyzerAiSchema } from "@/lib/ai/schemas";
import { systemContext } from "@/prompts/system-context";
import { productAnalyzerPrompt } from "@/prompts/product-analyzer";
import { serializeProject } from "@/lib/projects";

export class ProductAnalyzerNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project not found or access denied: ${projectId}`);
    this.name = "ProductAnalyzerNotFoundError";
  }
}

export class ProductAnalyzerAIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ProductAnalyzerAIError";
  }
}

export interface ProductAnalyzerInput {
  userId: string;
  projectId: string;
  description?: string;
}

export interface ProductAnalyzerResult {
  analysis: ProductAnalysis;
  project: ReturnType<typeof serializeProject>;
}

const gateway = new AIGateway();

export class ProductAnalyzerService {
  /**
   * Run a full product analysis for a project.
   *
   * Flow:
   *  1. Fetch project (ownership check) → 404 if missing
   *  2. Call AIGateway.generate() with productAnalyzerAiSchema
   *     (AIGateway handles retry + model fallback + usage logging internally)
   *  3. Persist a new ProductAnalysis record (full history)
   *  4. Update the Project snapshot fields (latest state for UI compatibility)
   *  5. Return serialized analysis + updated project
   */
  async analyze(input: ProductAnalyzerInput): Promise<ProductAnalyzerResult> {
    const { userId, projectId, description } = input;

    // ── 1. Ownership check ────────────────────────────────────────────────
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new ProductAnalyzerNotFoundError(projectId);
    }

    // ── 2. Call AI Gateway ────────────────────────────────────────────────
    // Retry + fallback + usage logging are all handled by AIGateway.generate()
    let aiResult;
    try {
      aiResult = await gateway.generate({
        userId,
        feature: "product-analyzer",
        systemPrompt: systemContext,
        userPrompt: productAnalyzerPrompt(
          project.productName,
          project.productCost.toNumber(),
          project.sellingPrice.toNumber(),
          description,
        ),
        schema: productAnalyzerAiSchema,
      });
    } catch (error) {
      throw new ProductAnalyzerAIError(
        "AI analysis failed after retries and fallback. Please try again.",
        error,
      );
    }

    // ── 3. Build opportunity score inputs snapshot ─────────────────────────
    const opportunityScoreInputs = {
      productScore: aiResult.productScore,
      marketScore: aiResult.marketScore,
      riskScore: aiResult.riskScore,
      difficultyScore: aiResult.difficultyScore,
      marketOpportunity: aiResult.marketOpportunity,
    };

    // ── 4. Persist ProductAnalysis record (full history) ──────────────────
    const analysis = await prisma.productAnalysis.create({
      data: {
        projectId,
        model: "product-analyzer", // feature key; actual model logged in AIUsageLog
        analysisVersion: "v1",
        // Core fields
        category: aiResult.category,
        demand: aiResult.demand,
        competition: aiResult.competition,
        emotionalTriggers: aiResult.emotionalTriggers,
        difficultyScore: aiResult.difficultyScore,
        marketOpportunity: aiResult.marketOpportunity,
        riskScore: aiResult.riskScore,
        marketScore: aiResult.marketScore,
        productScore: aiResult.productScore,
        // Extended Sprint 3B fields
        strengths: aiResult.mediaBuyerReport.strengths,
        weaknesses: aiResult.mediaBuyerReport.weaknesses,
        targetAudience: aiResult.targetAudience,
        pricingRecommendations: aiResult.pricingRecommendations,
        risks: aiResult.risks,
        // Structured report
        mediaBuyerReport: aiResult.mediaBuyerReport,
        // Opportunity score inputs snapshot
        opportunityScoreInputs,
      },
    });

    // ── 5. Update Project snapshot (latest analysis for UI compatibility) ──
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        category: aiResult.category,
        demand: aiResult.demand,
        competition: aiResult.competition,
        emotionalTriggers: aiResult.emotionalTriggers,
        difficultyScore: aiResult.difficultyScore,
        marketOpportunity: aiResult.marketOpportunity,
        riskScore: aiResult.riskScore,
        marketScore: aiResult.marketScore,
        productScore: aiResult.productScore,
        mediaBuyerReport: aiResult.mediaBuyerReport,
        analysisVersion: "v1",
      },
    });

    return {
      analysis,
      project: serializeProject(updatedProject),
    };
  }
}
