import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { calculateImportReadiness } from "@/lib/import-score";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImportSimulator } from "@/components/projects/ImportSimulator";
import { ImportExplanationClient } from "@/components/projects/ImportExplanationClient";


export default async function ImportDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { mediaBuyingTests: { include: { csvUploads: true } } }
  });

  if (!project) notFound();

  // Aggregate metrics for score
  let totalTrueProfit = 0;
  let totalDeliveryRate = 0;
  let totalConfirmationRate = 0;
  let testsWithData = 0;
  let countriesWon = 0;

  project.mediaBuyingTests.forEach(test => {
    if (test.status === "WINNER") countriesWon++;

    const dr = test.deliveryRate ? test.deliveryRate.toNumber() : 100;
    const cr = test.confirmationRate ? test.confirmationRate.toNumber() : 100;
    const rf = test.returnFee ? test.returnFee.toNumber() : 0;
    const sc = test.shippingCost ? test.shippingCost.toNumber() : 0;

    totalDeliveryRate += dr;
    totalConfirmationRate += cr;
    testsWithData++;

    let testProfit = 0;
    test.csvUploads.forEach(u => {
      const kpi = u.kpiSummary as { orders?: number; spend?: number; };
      if (kpi && kpi.orders) {
        const actualOrders = kpi.orders * (dr / 100);
        const returnedOrders = kpi.orders * ((test.returnRate ? test.returnRate.toNumber() : 0) / 100);
        const revenue = actualOrders * project.sellingPrice.toNumber();
        const spend = kpi.spend || 0;
        testProfit += revenue - spend - (actualOrders * project.productCost.toNumber()) - (actualOrders * sc) - (returnedOrders * rf);
      }
    });
    totalTrueProfit += testProfit;
  });

  const avgDr = testsWithData > 0 ? totalDeliveryRate / testsWithData : 100;
  const avgCr = testsWithData > 0 ? totalConfirmationRate / testsWithData : 100;

  const scoreData = calculateImportReadiness({
    researchScore: project.researchScore,
    countriesWon,
    trueProfit: totalTrueProfit,
    avgDeliveryRate: avgDr,
    avgConfirmationRate: avgCr,
    moq: project.supplierMoq,
    leadTime: project.supplierLeadTime,
    importFreight: project.importFreightCost ? project.importFreightCost.toNumber() : null,
    productCost: project.productCost.toNumber(),
    targetBudget: 5000 // Default example budget limit
  });

  // Save the score
  if (project.importReadinessScore !== scoreData.score) {
    await prisma.project.update({
      where: { id: project.id },
      data: { importReadinessScore: scoreData.score }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import Decision Center</h2>
        <p className="text-muted-foreground">Deterministic operational feasibility for bulk stock imports.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Readiness Score</CardTitle>
            <CardDescription>Based on real cashflow and supplier logistics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <span className="text-6xl font-bold">{scoreData.score}</span>
              <span className="text-xl font-medium px-4 py-1 rounded-full bg-muted">
                {scoreData.label}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Research Strength</span>
                <span className="font-medium">{scoreData.breakdown.research?.toFixed(1) ?? 0} / 20</span>
              </div>
              <div className="flex justify-between">
                <span>True Profit Margin</span>
                <span className="font-medium">{scoreData.breakdown.profit?.toFixed(1) ?? 0} / 25</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Stability</span>
                <span className="font-medium">{scoreData.breakdown.deliveryRate?.toFixed(1) ?? 0} / 20</span>
              </div>
              <div className="flex justify-between">
                <span>Confirmation Stability</span>
                <span className="font-medium">{scoreData.breakdown.confirmationRate?.toFixed(1) ?? 0} / 15</span>
              </div>
              <div className="flex justify-between">
                <span>Countries Won</span>
                <span className="font-medium">{scoreData.breakdown.countriesWon?.toFixed(1) ?? 0} / 10</span>
              </div>
              <div className="flex justify-between">
                <span>Capital Feasibility</span>
                <span className="font-medium">{scoreData.breakdown.moqFeasibility?.toFixed(1) ?? 0} / 5</span>
              </div>
              <div className="flex justify-between">
                <span>Lead Time Safety</span>
                <span className="font-medium">{scoreData.breakdown.leadTime?.toFixed(1) ?? 0} / 5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sourcing Constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Supplier MOQ</span>
                <span className="font-medium">{project.supplierMoq || "Unknown"} Units</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Lead Time</span>
                <span className="font-medium">{project.supplierLeadTime || "Unknown"} Days</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Freight Cost / Unit</span>
                <span className="font-medium">${project.importFreightCost?.toString() || "0.00"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Product Cost</span>
                <span className="font-medium">${project.productCost.toString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">Total Capital Required</span>
                <span className="font-bold text-lg">
                  {project.supplierMoq && project.importFreightCost 
                    ? `$${(project.supplierMoq * (project.productCost.toNumber() + project.importFreightCost.toNumber())).toFixed(2)}` 
                    : "Missing Data"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Real COD Profitability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Avg Delivery Rate</span>
                <span className="font-medium">{avgDr.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">Calculated True Profit</span>
                <span className={`font-bold ${totalTrueProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                  ${totalTrueProfit.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ImportExplanationClient payload={{
        productName: project.productName,
        importScore: scoreData.score,
        decisionThreshold: scoreData.label,
        moq: project.supplierMoq || 0,
        leadTime: project.supplierLeadTime || 0,
        capitalRequired: (project.supplierMoq || 0) * (project.productCost.toNumber() + (project.importFreightCost ? project.importFreightCost.toNumber() : 0)),
        countriesWon,
        avgDeliveryRate: avgDr,
        avgTrueProfit: totalTrueProfit / (testsWithData > 0 ? testsWithData : 1)
      }} />

      <div className="mt-8">
        <ImportSimulator 
          initialMoq={project.supplierMoq || 0}
          initialProductCost={project.productCost.toNumber()}
          initialFreightCost={project.importFreightCost ? project.importFreightCost.toNumber() : 0}
          initialDeliveryRate={avgDr}
          initialSellingPrice={project.sellingPrice.toNumber()}
        />
      </div>
    </div>
  );
}
