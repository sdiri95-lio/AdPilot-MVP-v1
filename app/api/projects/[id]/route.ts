import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: { codMetrics: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      productName,
      productCost,
      sellingPrice,
      shippingCost,
      serviceFee,
      targetCountry,
      productUrl,
      status,
      codMetrics,
    } = body;

    const projectUpdate: Prisma.ProjectUpdateInput = {};
    if (name !== undefined) projectUpdate.name = name;
    if (productName !== undefined) projectUpdate.productName = productName;
    if (productCost !== undefined) projectUpdate.productCost = Number(productCost);
    if (sellingPrice !== undefined) projectUpdate.sellingPrice = Number(sellingPrice);
    if (shippingCost !== undefined) projectUpdate.shippingCost = Number(shippingCost);
    if (serviceFee !== undefined) projectUpdate.serviceFee = Number(serviceFee);
    if (targetCountry !== undefined) projectUpdate.targetCountry = targetCountry;
    if (productUrl !== undefined) projectUpdate.productUrl = productUrl || null;
    if (status !== undefined) projectUpdate.status = status;

    if (codMetrics !== undefined) {
      projectUpdate.codMetrics = {
        update: {
          confirmationRate: codMetrics.confirmationRate !== undefined ? Number(codMetrics.confirmationRate) : undefined,
          deliveryRate: codMetrics.deliveryRate !== undefined ? Number(codMetrics.deliveryRate) : undefined,
          returnRate: codMetrics.returnRate !== undefined ? Number(codMetrics.returnRate) : undefined,
          shippingCost: codMetrics.shippingCost !== undefined ? Number(codMetrics.shippingCost) : undefined,
          returnFee: codMetrics.returnFee !== undefined ? Number(codMetrics.returnFee) : undefined,
        },
      };
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: projectUpdate,
      include: { codMetrics: true },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 });
  }
}
