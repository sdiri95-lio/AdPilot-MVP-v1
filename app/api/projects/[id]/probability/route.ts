import { NextResponse } from "next/server";
import type { WinningProbabilityAnalysis } from "@prisma/client";
import { ZodError } from "zod";

import { requireCurrentUser } from "@/lib/auth";
import {
  WinningProbabilityService,
  WinningProbabilityNotFoundError,
  WinningProbabilityAIError,
  WinningProbabilityPrerequisiteError,
} from "@/lib/ai/winning-probability";

const probabilityService = new WinningProbabilityService();

function serializeAnalysis(analysis: WinningProbabilityAnalysis) {
  return {
    ...analysis,
    reasoning: analysis.reasoning as string[],
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

    const result = await probabilityService.analyze({
      userId: user.id,
      projectId,
    });

    return NextResponse.json({
      analysis: serializeAnalysis(result.analysis),
      project: result.project,
    });
  } catch (error) {
    console.error("[WINNING_PROBABILITY_ERROR]", error);

    if (error instanceof WinningProbabilityNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof WinningProbabilityPrerequisiteError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof WinningProbabilityAIError) {
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
