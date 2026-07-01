import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const uploads = await prisma.csvUpload.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { mediaBuyingTest: true },
  });

  return NextResponse.json({ uploads });
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
  const { mediaBuyingTestId, rawData } = body;

  let mbt = null;
  if (mediaBuyingTestId) {
    mbt = await prisma.mediaBuyingTest.findUnique({ where: { id: mediaBuyingTestId } });
  }

  // Process raw data to calculate aggregate KPIs & creatives
  let spend = 0, orders = 0, impressions = 0, clicks = 0;
  
  const creativeMap = new Map<string, { spend: number, orders: number, impressions: number, clicks: number }>();
  
  if (Array.isArray(rawData)) {
    rawData.forEach((row: Record<string, string>) => {
      const rSpend = parseFloat(row["Amount spent (USD)"] || row["Amount spent"] || row["Spend"] || "0");
      const rOrders = parseInt(row["Purchases"] || row["Results"] || row["Orders"] || "0");
      const rImpressions = parseInt(row["Impressions"] || "0");
      const rClicks = parseInt(row["Link clicks"] || row["Clicks (all)"] || "0");
      
      spend += rSpend;
      orders += rOrders;
      impressions += rImpressions;
      clicks += rClicks;
      
      const adName = row["Ad name"] || row["Ad Set Name"] || row["Ad"] || "Unknown Creative";
      if (!creativeMap.has(adName)) {
        creativeMap.set(adName, { spend: 0, orders: 0, impressions: 0, clicks: 0 });
      }
      const c = creativeMap.get(adName)!;
      c.spend += rSpend;
      c.orders += rOrders;
      c.impressions += rImpressions;
      c.clicks += rClicks;
    });
  }

  const sellingPrice = project.sellingPrice.toNumber() || 0;
  const productCost = project.productCost.toNumber() || 0;
  
  // V1.1 COD Metrics
  const deliveryRate = mbt?.deliveryRate ? mbt.deliveryRate.toNumber() / 100 : 1;
  const returnRate = mbt?.returnRate ? mbt.returnRate.toNumber() / 100 : 0;
  const returnFee = mbt?.returnFee ? mbt.returnFee.toNumber() : 0;
  const shippingCost = mbt?.shippingCost ? mbt.shippingCost.toNumber() : 0;
  
  // True Profit Calculation
  const actualOrders = orders * deliveryRate;
  const returnedOrders = orders * returnRate;
  
  const revenue = actualOrders * sellingPrice;
  const profit = revenue - spend - (actualOrders * productCost) - (actualOrders * shippingCost) - (returnedOrders * returnFee);
  
  const roas = spend > 0 ? (orders * sellingPrice) / spend : 0; // Standard FB ROAS
  const cpp = orders > 0 ? spend / orders : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;

  const kpiSummary = {
    spend,
    orders,
    revenue,
    profit,
    roas,
    cpp,
    cpm,
    ctr,
    cpc
  };

  const upload = await prisma.csvUpload.create({
    data: {
      projectId: id,
      mediaBuyingTestId,
      fileUrl: "local-upload",
      status: "ANALYZED",
      parsedData: [], // DO NOT STORE raw JSON payload permanently (V1.1 scaling optimization)
      kpiSummary,
    },
    include: { mediaBuyingTest: true },
  });
  
  // Save creatives if we have a test attached
  if (mediaBuyingTestId) {
    const creativeCreates = Array.from(creativeMap.entries()).map(([name, data]) => {
      const cRev = (data.orders * deliveryRate) * sellingPrice;
      return {
        mediaBuyingTestId,
        name,
        spend: data.spend,
        orders: data.orders,
        revenue: cRev,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
        cpp: data.orders > 0 ? data.spend / data.orders : 0,
        roas: data.spend > 0 ? (data.orders * sellingPrice) / data.spend : 0,
      };
    });
    
    // Create new ones
    if (creativeCreates.length > 0) {
       await prisma.creativeTest.createMany({
         data: creativeCreates
       });
    }
  }

  // V1.1 Timeline Event
  const { logTimelineEvent } = await import("@/lib/timeline");
  await logTimelineEvent({
    projectId: id,
    eventType: "CSV_UPLOADED",
    title: "CSV Results Uploaded",
    description: `Spend: $${spend.toFixed(2)} | Orders: ${orders} | Profit: $${profit.toFixed(2)}`,
  });

  return NextResponse.json({ upload });
}
