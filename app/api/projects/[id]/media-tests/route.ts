import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const tests = await prisma.mediaBuyingTest.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tests });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  
  const test = await prisma.mediaBuyingTest.create({
    data: {
      projectId: id,
      country: body.country,
      dailyBudget: body.dailyBudget ? parseFloat(body.dailyBudget) : null,
      status: "RESEARCH",
      offer: body.offer,
      creative: body.creative,
      landingPage: body.landingPage,
    },
  });

  return NextResponse.json({ test });
}
