import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Globe2, TrendingUp } from "lucide-react";

type WinnersPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WinnersPage({ params }: WinnersPageProps) {
  const user = await requireCurrentUser();
  if (!user) return null;

  const { id } = await params;
  
  const winningTests = await prisma.mediaBuyingTest.findMany({
    where: { projectId: id, status: "WINNER" },
    include: { csvUploads: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Winners History</h2>
          <p className="text-sm text-muted-foreground">Historical record of all scaled winning tests for this product.</p>
        </div>
      </div>

      {winningTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed">
          <Trophy className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Winners Yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Scale tests to the Winner stage to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {winningTests.map(test => {
            // Find the best ROAS from CSV uploads
            const uploads = test.csvUploads.filter(u => u.kpiSummary);
            let bestRoas = 0;
            let bestCpp = 0;
            let totalSpend = 0;
            let totalRevenue = 0;

            uploads.forEach(u => {
              const kpi = u.kpiSummary as Record<string, number>;
              if (kpi.roas > bestRoas) bestRoas = kpi.roas;
              if (kpi.cpp > 0 && (bestCpp === 0 || kpi.cpp < bestCpp)) bestCpp = kpi.cpp;
              totalSpend += kpi.spend || 0;
              totalRevenue += kpi.revenue || 0;
            });

            return (
              <Card key={test.id} className="overflow-hidden border-yellow-200 dark:border-yellow-900/50">
                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/10 pb-4">
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span className="flex items-center gap-2"><Globe2 className="h-5 w-5" /> {test.country}</span>
                    <span className="text-sm font-normal text-muted-foreground">{new Date(test.launchDate || test.createdAt).toLocaleDateString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Best ROAS</p>
                      <p className="text-xl font-bold flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> {bestRoas.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best CPP</p>
                      <p className="text-xl font-bold">${bestCpp.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                      <p className="font-medium">${totalSpend.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="font-medium">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 space-y-2 border-t text-sm">
                    {test.offer && <p><span className="text-muted-foreground">Offer:</span> {test.offer}</p>}
                    {test.creative && <p><span className="text-muted-foreground">Creative:</span> {test.creative}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
