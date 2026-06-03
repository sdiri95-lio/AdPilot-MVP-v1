import type { WinningProbabilityAnalysis } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AIGateway } from "@/lib/ai/gateway";
import { opportunityScoreAiSchema } from "@/lib/ai/schemas";
import { systemContext } from "@/prompts/system-context";
import { winningProbabilityPrompt } from "@/prompts/winning-probability";
import { serializeProject } from "@/lib/projects";

export class WinningProbabilityNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project not found or access denied: ${projectId}`);
    this.name = "WinningProbabilityNotFoundError";
  }
}

export class WinningProbabilityPrerequisiteError extends Error {
  constructor(projectId: string) {
    super(`Product Analysis is required before calculating Winning Probability for project: ${projectId}`);
    this.name = "WinningProbabilityPrerequisiteError";
  }
}

export class WinningProbabilityAIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "WinningProbabilityAIError";
  }
}

export interface WinningProbabilityInput {
  userId: string;
  projectId: string;
}

export interface WinningProbabilityResult {
  analysis: WinningProbabilityAnalysis;
  project: ReturnType<typeof serializeProject>;
}

const gateway = new AIGateway();

export class WinningProbabilityService {
  async analyze(input: WinningProbabilityInput): Promise<WinningProbabilityResult> {
    const { userId, projectId } = input;

    // ── 1. Ownership & Prerequisite check ────────────────────────────────────────────────
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        productAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new WinningProbabilityNotFoundError(projectId);
    }

    const latestAnalysis = project.productAnalyses[0];
    
    // We try to extract opportunity score inputs from the latest analysis.
    // If not found, we check if the snapshot fields on the project itself exist.
    let productScore = project.productScore;
    let marketScore = project.marketScore;
    let riskScore = project.riskScore;

    if (latestAnalysis && latestAnalysis.opportunityScoreInputs) {
      const inputs = latestAnalysis.opportunityScoreInputs as any;
      productScore = inputs.productScore ?? productScore;
      marketScore = inputs.marketScore ?? marketScore;
      riskScore = inputs.riskScore ?? riskScore;
    }

    if (productScore === null || marketScore === null || riskScore === null) {
      throw new WinningProbabilityPrerequisiteError(projectId);
    }

    // ── 2. Call AI Gateway ────────────────────────────────────────────────
    let aiResult;
    try {
      aiResult = await gateway.generate({
        userId,
        feature: "opportunity-score",
        systemPrompt: systemContext,
        userPrompt: winningProbabilityPrompt(
          project.productName,
          productScore,
          marketScore,
          riskScore
        ),
        schema: opportunityScoreAiSchema,
      });
    } catch (error) {
      throw new WinningProbabilityAIError(
        "AI winning probability calculation failed after retries and fallback. Please try again.",
        error,
      );
    }

    // ── 3. Persist WinningProbabilityAnalysis record (full history) ──────────────────
    const analysis = await prisma.winningProbabilityAnalysis.create({
      data: {
        projectId,
        model: "opportunity-score",
        analysisVersion: "v1",
        winningProbability: aiResult.winningProbability,
        confidenceScore: aiResult.confidenceScore,
        reasoning: aiResult.reasoning,
        recommendation: aiResult.recommendation,
      },
    });

    // ── 4. Update Project snapshot ───────────────────────────────────────────────────
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        winningProbability: aiResult.winningProbability,
        confidenceScore: aiResult.confidenceScore,
        opportunityReasoning: aiResult.reasoning,
        opportunityRecommendation: aiResult.recommendation,
      },
    });

    return {
      analysis,
      project: serializeProject(updatedProject),
    };
  }
}
