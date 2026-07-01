import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) return new NextResponse("Not found", { status: 404 });

    await prisma.project.update({
      where: { id },
      data: { isArchived: true }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Archive project error:", err);
    return new NextResponse(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
