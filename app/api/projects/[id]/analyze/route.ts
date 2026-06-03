import type { ProductAnalysis } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireCurrentUser } from "@/lib/auth";
import { analyzeProductRequestSchema } from "@/lib/validators";
import {
  ProductAnalyzerService,
  ProductAnalyzerNotFoundError,
  ProductAnalyzerAIError,
} from "@/lib/ai/product-analyzer";

type AnalyzeRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const analyzerService = new ProductAnalyzerService();

export async function POST(request: Request, { params }: AnalyzeRouteProps) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ── Usage limit guard ─────────────────────────────────────────────────────
  if (!user.usage || user.usage.aiCallsUsed >= user.usage.aiCallsLimit) {
    return NextResponse.json(
      { message: "AI usage limit reached. Upgrade your plan to continue." },
      { status: 403 },
    );
  }

  // ── Request validation ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Body is optional (description is optional) — treat missing/empty body as {}
    body = {};
  }

  const parsed = analyzeProductRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request body", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id: projectId } = await params;

  // ── Service call ──────────────────────────────────────────────────────────
  try {
    const result = await analyzerService.analyze({
      userId: user.id,
      projectId,
      description: parsed.data.description,
    });

    return NextResponse.json(
      {
        analysis: serializeAnalysis(result.analysis),
        project: result.project,
      },
      { status: 200 },
    );
  } catch (error) {
    // Project not found or not owned by user
    if (error instanceof ProductAnalyzerNotFoundError) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // AI pipeline failure (after retries + fallback exhausted)
    if (error instanceof ProductAnalyzerAIError) {
      console.error("[analyze] AI pipeline failed:", error.cause);
      return NextResponse.json(
        { message: error.message },
        { status: 502 },
      );
    }

    // Unexpected Zod validation error (schema mismatch from AI)
    if (error instanceof ZodError) {
      console.error("[analyze] AI response failed schema validation:", error.flatten());
      return NextResponse.json(
        { message: "AI returned an invalid response. Please retry." },
        { status: 502 },
      );
    }

    // Catch-all
    console.error("[analyze] Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── Serializer ─────────────────────────────────────────────────────────────────
// Converts Prisma ProductAnalysis (with opaque Json fields) into a fully typed
// plain object that is safe to return as JSON.
function serializeAnalysis(analysis: ProductAnalysis) {
  return {
    id: analysis.id,
    projectId: analysis.projectId,
    model: analysis.model,
    analysisVersion: analysis.analysisVersion,
    category: analysis.category,
    demand: analysis.demand,
    competition: analysis.competition,
    emotionalTriggers: analysis.emotionalTriggers as string[] | null,
    difficultyScore: analysis.difficultyScore,
    marketOpportunity: analysis.marketOpportunity,
    riskScore: analysis.riskScore,
    marketScore: analysis.marketScore,
    productScore: analysis.productScore,
    strengths: analysis.strengths as string[] | null,
    weaknesses: analysis.weaknesses as string[] | null,
    targetAudience: analysis.targetAudience as string[] | null,
    pricingRecommendations: analysis.pricingRecommendations as string[] | null,
    risks: analysis.risks as string[] | null,
    mediaBuyerReport: analysis.mediaBuyerReport as {
      summary: string;
      recommendation: string;
      strengths: string[];
      weaknesses: string[];
      nextActions: string[];
    } | null,
    opportunityScoreInputs: analysis.opportunityScoreInputs as {
      productScore: number | null;
      marketScore: number | null;
      riskScore: string | null;
      difficultyScore: number | null;
      marketOpportunity: number | null;
    } | null,
    createdAt: analysis.createdAt.toISOString(),
  };
}
