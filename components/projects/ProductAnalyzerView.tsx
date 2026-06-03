"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectResponse } from "@/lib/validators";
import type { ProjectDetailResponse, AnalyzeProductResponse } from "@/types/api";

type ProductAnalyzerViewProps = {
  projectId: string;
};

export function ProductAnalyzerView({ projectId }: ProductAnalyzerViewProps) {
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
      } catch (e) {
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
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze product.");
      }
      setProject(data.project);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
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

  const hasAnalysis = !!project.mediaBuyerReport;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Product Analyzer</h2>
          <p className="text-sm text-muted-foreground">
            Generate an AI media buyer report and market assessment.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            hasAnalysis ? "Re-Analyze Product" : "Analyze Product"
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
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
            Run the product analyzer to get a detailed breakdown of your product's market potential.
          </p>
          <Button onClick={handleAnalyze}>Start Analysis</Button>
        </Card>
      )}

      {hasAnalysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Media Buyer Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1 text-muted-foreground">Summary</h4>
                <p className="text-sm">{project.mediaBuyerReport?.summary}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-muted-foreground">Recommendation</h4>
                <p className="text-sm">{project.mediaBuyerReport?.recommendation}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {project.mediaBuyerReport?.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {project.mediaBuyerReport?.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Demand</dt>
                  <dd className="font-medium">{project.demand}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Competition</dt>
                  <dd className="font-medium">{project.competition}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Risk Level</dt>
                  <dd className="font-medium">{project.riskScore}</dd>
                </div>
              </dl>
              <div>
                <h4 className="font-medium text-sm mb-2 text-muted-foreground mt-4">Emotional Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {project.emotionalTriggers?.map((trigger, i) => (
                    <Badge variant="secondary" key={i}>{trigger}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <dt className="text-muted-foreground">Product Score</dt>
                    <dd className="font-medium">{project.productScore}/10</dd>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(project.productScore || 0) * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <dt className="text-muted-foreground">Market Score</dt>
                    <dd className="font-medium">{project.marketScore}/10</dd>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(project.marketScore || 0) * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <dt className="text-muted-foreground">Market Opportunity</dt>
                    <dd className="font-medium">{project.marketOpportunity}/10</dd>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(project.marketOpportunity || 0) * 10}%` }} />
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
