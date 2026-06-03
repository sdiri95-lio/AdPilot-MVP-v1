import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireCurrentUser } from "@/lib/auth";
import {
  ProfitCalculatorService,
  ProfitCalculatorNotFoundError,
  ProfitCalculatorAIError,
} from "@/lib/ai/profit-calculator";

const profitService = new ProfitCalculatorService();

function serializeAnalysis(analysis: any) {
  return {
    ...analysis,
    assumptions: analysis.assumptions as string[],
    revenue: analysis.revenue.toNumber(),
    margin: analysis.margin.toNumber(),
    marginPercent: analysis.marginPercent.toNumber(),
    breakEvenCpl: analysis.breakEvenCpl.toNumber(),
    breakEvenCpa: analysis.breakEvenCpa.toNumber(),
    targetCpl: analysis.targetCpl.toNumber(),
    targetCpa: analysis.targetCpa.toNumber(),
    minCpl: analysis.minCpl.toNumber(),
    recommendedCpl: analysis.recommendedCpl.toNumber(),
    maxCpl: analysis.maxCpl.toNumber(),
    createdAt: analysis.createdAt.toISOString(),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!user.usage || user.usage.aiCallsUsed >= user.usage.aiCallsLimit) {
      return NextResponse.json(
        { message: "AI usage limit reached. Upgrade your plan to continue." },
        { status: 403 },
      );
    }

    const { id: projectId } = await params;

    const result = await profitService.analyze({
      userId: user.id,
      projectId,
    });

    return NextResponse.json({
      analysis: serializeAnalysis(result.analysis),
      project: result.project,
    });
  } catch (error) {
    console.error("[PROFIT_CALCULATOR_ERROR]", error);

    if (error instanceof ProfitCalculatorNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ProfitCalculatorAIError) {
      return NextResponse.json(
        { message: error.message, details: (error.cause as Error)?.message },
        { status: 502 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid AI response structure.", errors: error.errors },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
