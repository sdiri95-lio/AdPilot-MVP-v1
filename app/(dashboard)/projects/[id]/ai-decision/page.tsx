import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { AIDecisionClient } from "@/components/projects/AIDecisionClient";

export default async function AIDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      mediaBuyingTests: {
        include: { csvUploads: true }
      },
      timelineEvents: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) notFound();

  // Map tests to a flat structure we can pass to the client for AI analysis
  const tests = project.mediaBuyingTests.map(test => {
    let spend = 0, orders = 0, revenue = 0;
    
    test.csvUploads.forEach(u => {
      const kpi = u.kpiSummary as { spend?: number, orders?: number, ctr?: number, cpc?: number, revenue?: number };
      if (kpi) {
        spend += kpi.spend || 0;
        orders += kpi.orders || 0;
        revenue += kpi.revenue || 0;
        
        // Approximate clicks and impressions from CTR/CPC if needed, or just rely on kpi object
      }
    });

    const dr = test.deliveryRate ? test.deliveryRate.toNumber() : 100;
    
    const rr = test.returnRate ? test.returnRate.toNumber() : 0;
    const rf = test.returnFee ? test.returnFee.toNumber() : 0;
    const sc = test.shippingCost ? test.shippingCost.toNumber() : 0;
    
    const actualOrders = orders * (dr / 100);
    const returnedOrders = orders * (rr / 100);
    const trueProfit = revenue - spend - (actualOrders * project.productCost.toNumber()) - (actualOrders * sc) - (returnedOrders * rf);

    const roas = spend > 0 ? revenue / spend : 0;
    const cpp = orders > 0 ? spend / orders : 0;
    // Mock CTR and CPC if not strictly aggregated across all CSVs correctly
    let avgCtr = 0;
    let avgCpc = 0;
    let csvCount = 0;
    test.csvUploads.forEach(u => {
      const kpi = u.kpiSummary as { ctr?: number; cpc?: number; };
      if (kpi && kpi.ctr !== undefined) {
        avgCtr += kpi.ctr;
        avgCpc += kpi.cpc ?? 0;
        csvCount++;
      }
    });
    if (csvCount > 0) {
      avgCtr /= csvCount;
      avgCpc /= csvCount;
    }

    return {
      id: test.id,
      country: test.country,
      status: test.status,
      spend,
      orders,
      roas,
      ctr: avgCtr,
      cpc: avgCpc,
      cpp,
      deliveryRate: dr,
      trueProfit
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Decision Engine</h2>
        <p className="text-muted-foreground">Expert operational guidance based on real test performance.</p>
      </div>

      <AIDecisionClient 
        project={{ id: project.id, productName: project.productName }} 
        tests={tests}
        timelineEvents={project.timelineEvents}
      />
    </div>
  );
}
