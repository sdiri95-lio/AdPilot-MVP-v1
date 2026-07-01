import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await requireUserId();

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { codMetrics: true },
    });

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { name, productName, productCost, sellingPrice, shippingCost, serviceFee, targetCountry, productUrl } = body;

    if (!name || !productName || productCost === undefined || sellingPrice === undefined || shippingCost === undefined || serviceFee === undefined || !targetCountry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the project and automatically link a default CODMetrics record
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        productName,
        productCost: Number(productCost),
        sellingPrice: Number(sellingPrice),
        shippingCost: Number(shippingCost),
        serviceFee: Number(serviceFee),
        targetCountry,
        productUrl: productUrl || null,
        codMetrics: {
          create: {
            confirmationRate: 100.0,
            deliveryRate: 100.0,
            returnRate: 0.0,
            shippingCost: Number(shippingCost), // seed outbound shipping cost from project's shippingCost
            returnFee: 0.0,
          },
        },
      },
      include: { codMetrics: true },
    });

    return NextResponse.json({ project });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 });
  }
}
