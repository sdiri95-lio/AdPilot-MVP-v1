"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectResponse } from "@/lib/validators";
import type { ProjectDetailResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type WinningProbabilityViewProps = {
  projectId: string;
};

export function WinningProbabilityView({ projectId }: WinningProbabilityViewProps) {
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
      const response = await fetch(`/api/projects/${projectId}/probability`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate winning probability.");
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

  const hasAnalysis = project.winningProbability !== null && project.winningProbability !== undefined;
  
  // Can only run if Product Analyzer was run
  const canRun = !!project.productScore && !!project.marketScore;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Winning Probability</h2>
          <p className="text-sm text-muted-foreground">
            Calculate the statistical probability of this product succeeding.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !canRun}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            hasAnalysis ? "Recalculate Probability" : "Calculate Probability"
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!canRun && (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border bg-muted/50">
          <HelpCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Prerequisites Missing</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            You must run the Product Analyzer first to gather the necessary market and product scores before calculating winning probability.
          </p>
        </div>
      )}

      {!hasAnalysis && !isAnalyzing && !error && canRun && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Ready to Calculate</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
            Generate an AI-driven probability score based on your product analysis and market data.
          </p>
          <Button onClick={handleAnalyze}>Calculate Now</Button>
        </Card>
      )}

      {hasAnalysis && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Opportunity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold flex items-baseline gap-1">
                {project.winningProbability}
                <span className="text-xl font-normal text-muted-foreground">%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full",
                    (project.winningProbability || 0) >= 70 ? "bg-green-500" : (project.winningProbability || 0) >= 40 ? "bg-yellow-500" : "bg-destructive"
                  )} 
                  style={{ width: `${project.winningProbability}%` }} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold flex items-baseline gap-1">
                {project.confidenceScore}
                <span className="text-xl font-normal text-muted-foreground">%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${project.confidenceScore}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Verdict</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-full pb-6">
              <div className={cn(
                "inline-flex px-4 py-2 rounded-md font-bold text-lg justify-center",
                project.opportunityRecommendation === "TEST" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                project.opportunityRecommendation === "MONITOR" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                project.opportunityRecommendation === "SKIP" && "bg-destructive/10 text-destructive dark:bg-destructive/20"
              )}>
                {project.opportunityRecommendation || "UNKNOWN"}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>AI Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {project.opportunityReasoning?.map((reason, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{reason}</span>
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
