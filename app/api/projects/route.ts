import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/projects";
import { projectCreateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
      status: status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { productName: { contains: search, mode: "insensitive" } },
              { targetCountry: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const activeProjectCount = await prisma.project.count({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
  });

  return NextResponse.json({
    projects: projects.map(serializeProject),
    usage: {
      activeProjectCount,
      projectLimit: user.usage?.projectLimit ?? 5,
      subscription: user.subscription,
    },
  });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = projectCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid project input", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (user.subscription === "FREE_TRIAL") {
    const activeProjectCount = await prisma.project.count({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    const projectLimit = user.usage?.projectLimit ?? 5;

    if (activeProjectCount >= projectLimit) {
      return NextResponse.json(
        {
          message:
            "Free trial project limit reached. Archive a project before creating another.",
        },
        { status: 403 },
      );
    }
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      productName: parsed.data.productName,
      productUrl: parsed.data.productUrl,
      imageUrl: parsed.data.imageUrl,
      targetCountry: parsed.data.targetCountry,
      productType: parsed.data.productType,
      productCost: parsed.data.productCost,
      sellingPrice: parsed.data.sellingPrice,
      shippingCost: parsed.data.shippingCost,
      serviceFee: parsed.data.serviceFee,
      desiredProfit: parsed.data.desiredProfit,
    },
  });

  await prisma.usage.update({
    where: {
      userId: user.id,
    },
    data: {
      activeProjectCount: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({ project: serializeProject(project) }, { status: 201 });
}
