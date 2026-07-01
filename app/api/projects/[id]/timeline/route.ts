import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logTimelineEvent } from "@/lib/timeline";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const { eventType, title, description, metadata } = body;

  await logTimelineEvent({
    projectId: id,
    eventType: eventType || "SCALING_ACTION",
    title: title || "Scaling Action Logged",
    description,
    metadata
  });

  return NextResponse.json({ success: true });
}
