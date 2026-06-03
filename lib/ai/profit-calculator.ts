export interface ProfitCalculatorInput {
  productCost: number;
  sellingPrice: number;
  shippingCost: number;
  serviceFee: number;
  desiredProfit: number;
}

export interface ProfitCalculatorResult {
  revenue: number;
  margin: number;
  marginPercent: number;
  breakEvenCpl: number;
  breakEvenCpa: number;
  targetCpl: number;
  targetCpa: number;
  minCpl: number;
  recommendedCpl: number;
  maxCpl: number;
}

export function calculateProfitMetrics(input: ProfitCalculatorInput): ProfitCalculatorResult {
  const { productCost, sellingPrice, shippingCost, serviceFee, desiredProfit } = input;

  const revenue = sellingPrice;
  const totalCost = productCost + shippingCost + serviceFee;
  const margin = revenue - totalCost;
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

  // CPA (Cost Per Acquisition) - The maximum we can spend to acquire a customer and break even
  const breakEvenCpa = margin;

  // Target CPA leaves room for the desired profit
  const targetCpa = Math.max(0, margin - desiredProfit);

  // Assuming a standard 3% conversion rate to calculate CPL (Cost Per Lead/Click)
  const assumedConversionRate = 0.03;
  
  const breakEvenCpl = breakEvenCpa * assumedConversionRate;
  const targetCpl = targetCpa * assumedConversionRate;
  
  const minCpl = targetCpl * 0.8;
  const recommendedCpl = targetCpl;
  const maxCpl = breakEvenCpl;

  return {
    revenue: Number(revenue.toFixed(2)),
    margin: Number(margin.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(2)),
    breakEvenCpl: Number(breakEvenCpl.toFixed(2)),
    breakEvenCpa: Number(breakEvenCpa.toFixed(2)),
    targetCpl: Number(targetCpl.toFixed(2)),
    targetCpa: Number(targetCpa.toFixed(2)),
    minCpl: Number(minCpl.toFixed(2)),
    recommendedCpl: Number(recommendedCpl.toFixed(2)),
    maxCpl: Number(maxCpl.toFixed(2))
  };
}

import type { ProfitAnalysis } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AIGateway } from "@/lib/ai/gateway";
import { profitCalculatorAiSchema } from "@/lib/ai/schemas";
import { systemContext } from "@/prompts/system-context";
import { profitCalculatorPrompt } from "@/prompts/profit-calculator";
import { serializeProject } from "@/lib/projects";

export class ProfitCalculatorNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project not found or access denied: ${projectId}`);
    this.name = "ProfitCalculatorNotFoundError";
  }
}

export class ProfitCalculatorAIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ProfitCalculatorAIError";
  }
}

export interface ProfitCalculatorServiceInput {
  userId: string;
  projectId: string;
}

export interface ProfitCalculatorServiceResult {
  analysis: ProfitAnalysis;
  project: ReturnType<typeof serializeProject>;
}

const gateway = new AIGateway();

export class ProfitCalculatorService {
  async analyze(input: ProfitCalculatorServiceInput): Promise<ProfitCalculatorServiceResult> {
    const { userId, projectId } = input;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new ProfitCalculatorNotFoundError(projectId);
    }

    // 1. Calculate pure math metrics
    const metrics = calculateProfitMetrics({
      productCost: project.productCost.toNumber(),
      sellingPrice: project.sellingPrice.toNumber(),
      shippingCost: project.shippingCost.toNumber(),
      serviceFee: project.serviceFee.toNumber(),
      desiredProfit: project.desiredProfit.toNumber(),
    });

    // 2. Call AI Gateway for assumptions
    let aiResult;
    try {
      aiResult = await gateway.generate({
        userId,
        feature: "profit-calculator", // Need to register this in gateway
        systemPrompt: systemContext,
        userPrompt: profitCalculatorPrompt(
          project.productName,
          project.category,
          project.targetCountry,
          metrics
        ),
        schema: profitCalculatorAiSchema,
      });
    } catch (error) {
      throw new ProfitCalculatorAIError(
        "AI profit analysis failed after retries and fallback. Please try again.",
        error,
      );
    }

    // 3. Persist ProfitAnalysis record (history)
    const analysis = await prisma.profitAnalysis.create({
      data: {
        projectId,
        model: "profit-calculator",
        analysisVersion: "v1",
        revenue: metrics.revenue,
        margin: metrics.margin,
        marginPercent: metrics.marginPercent,
        breakEvenCpl: metrics.breakEvenCpl,
        breakEvenCpa: metrics.breakEvenCpa,
        targetCpl: metrics.targetCpl,
        targetCpa: metrics.targetCpa,
        minCpl: metrics.minCpl,
        recommendedCpl: metrics.recommendedCpl,
        maxCpl: metrics.maxCpl,
        assumptions: aiResult.assumptions,
      },
    });

    // 4. Update Project snapshot
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        revenue: metrics.revenue,
        margin: metrics.margin,
        marginPercent: metrics.marginPercent,
        breakEvenCpl: metrics.breakEvenCpl,
        breakEvenCpa: metrics.breakEvenCpa,
        targetCpl: metrics.targetCpl,
        targetCpa: metrics.targetCpa,
        minCpl: metrics.minCpl,
        recommendedCpl: metrics.recommendedCpl,
        maxCpl: metrics.maxCpl,
        profitAssumptions: aiResult.assumptions,
      },
    });

    return {
      analysis,
      project: serializeProject(updatedProject),
    };
  }
}
