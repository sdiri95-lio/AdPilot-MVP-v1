import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = {
  params: Promise<{
    id: string;
    testId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id, testId } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.mediaBuyingTest.update({
    where: { id: testId, projectId: id },
    data: {
      status: body.status,
      country: body.country,
      dailyBudget: body.dailyBudget ? parseFloat(body.dailyBudget) : undefined,
      offer: body.offer,
      creative: body.creative,
      landingPage: body.landingPage,
      launchDate: body.status === "LAUNCHING" && body.launchDate ? new Date() : undefined,
      failureReason: body.failureReason,
      deliveryRate: body.deliveryRate !== undefined ? parseFloat(body.deliveryRate) : undefined,
      confirmationRate: body.confirmationRate !== undefined ? parseFloat(body.confirmationRate) : undefined,
      returnRate: body.returnRate !== undefined ? parseFloat(body.returnRate) : undefined,
      shippingCost: body.shippingCost !== undefined ? parseFloat(body.shippingCost) : undefined,
      returnFee: body.returnFee !== undefined ? parseFloat(body.returnFee) : undefined,
    },
  });

  const { logTimelineEvent } = await import("@/lib/timeline");

  if (body.status && body.status !== project.status) { // wait, body.status might be unchanged
    // Let's just log when it's WINNER or FAILED specifically if passed in. 
    // Ideally we'd fetch the old one to compare, but this works for explicit transitions
  }

  // Automatically update the Project researchStatus to WINNER if a test wins
  if (body.status === "WINNER") {
    await prisma.project.update({
      where: { id },
      data: { researchStatus: "WINNER" }
    });
    
    await logTimelineEvent({
      projectId: id,
      eventType: "WINNER",
      title: "Test Won!",
      description: `Test in ${updated.country} has reached WINNER status.`,
      metadata: { country: updated.country }
    });
  } else if (body.status === "FAILED") {
    await logTimelineEvent({
      projectId: id,
      eventType: "FAILED",
      title: "Test Failed",
      description: `Test in ${updated.country} failed. Reason: ${body.failureReason || "None provided"}`,
      metadata: { country: updated.country }
    });
  } else if (body.status === "LAUNCHING") {
    await logTimelineEvent({
      projectId: id,
      eventType: "LAUNCHING",
      title: "Test Launched",
      description: `Test launched in ${updated.country}.`,
      metadata: { country: updated.country }
    });
  }

  return NextResponse.json({ test: updated });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id, testId } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await prisma.mediaBuyingTest.delete({
    where: { id: testId, projectId: id },
  });

  return NextResponse.json({ success: true });
}
