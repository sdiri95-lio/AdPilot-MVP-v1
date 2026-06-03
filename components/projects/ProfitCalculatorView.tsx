"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Calculator, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ProjectResponse } from "@/lib/validators";
import type { ProjectDetailResponse } from "@/types/api";

type ProfitCalculatorViewProps = {
  projectId: string;
};

export function ProfitCalculatorView({ projectId }: ProfitCalculatorViewProps) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const payload = await response.json() as ProjectDetailResponse;
          setProject(payload.project);
        } else {
          setError("Failed to load project details.");
        }
      } catch {
        setError("Network error loading project.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadProject();
  }, [projectId]);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/profit`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate profit metrics.");
      }
      setProject(data.project);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error || "Project not found."}
      </div>
    );
  }

  const hasAnalysis = project.margin !== null && project.margin !== undefined && !!project.profitAssumptions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Profit Calculator</h2>
          <p className="text-sm text-muted-foreground">
            Evaluate your product&apos;s financial viability and get AI-driven market assumptions.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            hasAnalysis ? "Recalculate Profit" : "Calculate Profit"
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!hasAnalysis && !isAnalyzing && !error && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No Profit Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
            Run the calculator to reveal your break-even metrics, target CPL, and AI market assumptions.
          </p>
          <Button onClick={handleAnalyze}>Calculate Profit</Button>
        </Card>
      )}

      {hasAnalysis && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-baseline gap-1 text-primary">
                <span className="text-xl font-normal text-primary/70">$</span>
                {project.margin}
              </div>
              <div className="mt-2 text-sm font-medium">
                {project.marginPercent}% Profit Margin
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Revenue: ${project.revenue}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Acquisition (CPA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Target CPA</div>
                <div className="text-2xl font-bold flex items-baseline gap-1">
                  <span className="text-lg font-normal text-muted-foreground">$</span>
                  {project.targetCpa}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Break-Even CPA</div>
                <div className="text-xl font-semibold flex items-baseline gap-1 text-destructive">
                  <span className="text-base font-normal text-destructive/70">$</span>
                  {project.breakEvenCpa}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lead (CPL)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Target CPL</div>
                <div className="text-2xl font-bold flex items-baseline gap-1">
                  <span className="text-lg font-normal text-muted-foreground">$</span>
                  {project.targetCpl}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Break-Even CPL</div>
                <div className="text-xl font-semibold flex items-baseline gap-1 text-destructive">
                  <span className="text-base font-normal text-destructive/70">$</span>
                  {project.breakEvenCpl}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                AI Market Assumptions
              </CardTitle>
              <CardDescription>Based on your target market and specific product metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {project.profitAssumptions?.map((assumption, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{assumption}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
