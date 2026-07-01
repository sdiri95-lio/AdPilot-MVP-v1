import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { generateCountryRecommendations } from "@/lib/country-expansion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CountryExpansionPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { mediaBuyingTests: true }
  });

  if (!project) notFound();

  // Find winning tests to base recommendations on
  const winningTests = project.mediaBuyingTests.filter(t => t.status === "WINNER");
  const testedCountries = project.mediaBuyingTests.map(t => t.country);

  // If no winners, we can't recommend scale.
  if (winningTests.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold tracking-tight">Country Expansion Engine</h2>
        <p className="text-muted-foreground">You need at least one winning test to generate expansion recommendations.</p>
      </div>
    );
  }

  // Fetch all historical tests for the category globally to feed the engine
  const allTests = await prisma.mediaBuyingTest.findMany({
    where: { 
      project: { category: project.category } 
    },
    include: {
      project: true,
      csvUploads: true
    }
  });

  // Map to HistoricalCountryData
  const historicalDataMap = new Map<string, { total: number, winners: number, sumRoas: number }>();
  
  allTests.forEach(test => {
    if (!historicalDataMap.has(test.country)) {
      historicalDataMap.set(test.country, { total: 0, winners: 0, sumRoas: 0 });
    }
    const d = historicalDataMap.get(test.country)!;
    d.total += 1;
    if (test.status === "WINNER") d.winners += 1;
    
    // Calculate ROAS from CSVs
    let testSpend = 0, testRev = 0;
    test.csvUploads.forEach(u => {
      const kpi = u.kpiSummary as { spend?: number; revenue?: number; };
      if (kpi && kpi.spend) {
        testSpend += kpi.spend;
        testRev += kpi.revenue || 0;
      }
    });
    if (testSpend > 0) d.sumRoas += (testRev / testSpend);
  });

  const historicalInput = Array.from(historicalDataMap.entries()).map(([country, data]) => ({
    country,
    category: project.category || "Unknown",
    totalTests: data.total,
    winners: data.winners,
    avgRoas: data.total > 0 ? data.sumRoas / data.total : 0
  }));

  // Generate recommendations based on the first winning country
  // (If multiple winners, we base it on the first one or could aggregate)
  const baseWinner = winningTests[0].country;
  
  const { recommendedCountries, confidenceScore } = generateCountryRecommendations(
    project.category || "Unknown",
    baseWinner,
    testedCountries,
    historicalInput
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Country Expansion Engine</h2>
        <p className="text-muted-foreground">Deterministic, rules-based recommendations for your next scaling target.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Basis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{project.category || "Uncategorized"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Winning Baseline</span>
              <Badge variant="default">{baseWinner}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Already Tested</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {testedCountries.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Markets</CardTitle>
            <CardDescription>Based on historical win rates in {project.category}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <span className="font-medium">Engine Confidence</span>
              <Badge variant={confidenceScore > 80 ? "default" : "secondary"}>
                {confidenceScore}%
              </Badge>
            </div>
            
            {recommendedCountries.length > 0 ? (
              <div className="space-y-3">
                {recommendedCountries.map((country, idx) => (
                  <div key={country} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                    <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                    <span className="font-medium text-lg">{country}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations available. Expand testing data in this category.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
