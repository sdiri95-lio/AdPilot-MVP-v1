"use client";

import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  Brain,
  CheckCircle,
  Calendar,
  Sparkles,
  DollarSign,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { AdvertisingIntelligenceAiResult } from "@/lib/ai/schemas";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SerializedProject = {
  id: string;
  productName: string;
  sellingPrice: number;
  productCost: number;
  targetCountry: string;
};

type SerializedAnalysis = {
  id: string;
  projectId: string;
  csvUploadId: string | null;
  campaignHealthScore: number;
  overallDecision: string;
  confidenceScore: number;
  creativeRanking: unknown;
  winningAdSets: unknown;
  losingAdSets: unknown;
  fatigueWarnings: unknown;
  businessIntel: unknown;
  optimizationActions: unknown;
  actionPlan: unknown;
  createdAt: string;
  csvUpload: {
    id: string;
    createdAt: string;
    mediaBuyingTest: {
      id: string;
      country: string;
      offer: string | null;
    } | null;
  } | null;
};

type AdIntelligenceClientProps = {
  project: SerializedProject;
  analyses: SerializedAnalysis[];
};

export function AdIntelligenceClient({ project, analyses: initialAnalyses }: AdIntelligenceClientProps) {
  const [analyses, setAnalyses] = useState<SerializedAnalysis[]>(initialAnalyses);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    initialAnalyses[0]?.id || ""
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId);

  // Trigger analysis on-demand
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/ad-intelligence/analyze`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI analysis.");
      }

      toast({
        title: "Analysis Completed",
        description: "AI Ad Intelligence report has been generated successfully.",
      });

      // Update state: prepend new analysis and select it
      const newAnalysis: SerializedAnalysis = {
        ...data.analysis,
        createdAt: new Date(data.analysis.createdAt).toISOString(),
      };
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedAnalysisId(newAnalysis.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not generate AI analysis.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: msg,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (analyses.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <Brain className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
        <CardTitle className="mb-2">No Ad Intelligence Reports Yet</CardTitle>
        <CardDescription className="max-w-md mb-6">
          To run AI Ad Intelligence audits, please upload a Facebook Ads CSV export under the **CSV Results** tab first.
        </CardDescription>
        <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing CSV Data...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Latest CSV Data
            </>
          )}
        </Button>
      </Card>
    );
  }

  const analysis = selectedAnalysis!;
  
  // Safely parse JSON blocks
  const businessIntel = (analysis.businessIntel || {}) as AdvertisingIntelligenceAiResult["businessIntel"];
  const creativeRanking = (analysis.creativeRanking || []) as AdvertisingIntelligenceAiResult["creativeRanking"];
  const winningAdSets = (analysis.winningAdSets || []) as AdvertisingIntelligenceAiResult["winningAdSets"];
  const losingAdSets = (analysis.losingAdSets || []) as AdvertisingIntelligenceAiResult["losingAdSets"];
  const fatigueWarnings = (analysis.fatigueWarnings || []) as AdvertisingIntelligenceAiResult["fatigueWarnings"];
  const optimizationActions = (analysis.optimizationActions || []) as AdvertisingIntelligenceAiResult["optimizationActions"];
  const actionPlan = (analysis.actionPlan || {}) as AdvertisingIntelligenceAiResult["actionPlan"];

  // Helper for color coding the decision badge
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "SCALE":
        return <Badge className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white">SCALE SIGNALS</Badge>;
      case "OPTIMIZE":
        return <Badge className="bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 text-white">OPTIMIZE REQUIRED</Badge>;
      case "RETEST":
        return <Badge className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white">RETEST STRATEGY</Badge>;
      case "KILL":
        return <Badge className="bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white">KILL CAMPAIGN</Badge>;
      default:
        return <Badge variant="secondary">{decision}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Dashboard Header / History Selector ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <select
            className="bg-transparent border-none font-medium focus:ring-0 text-sm cursor-pointer"
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
          >
            {analyses.map((a) => {
              const testCountry = a.csvUpload?.mediaBuyingTest?.country;
              const uploadDate = new Date(a.createdAt).toLocaleDateString();
              const label = testCountry 
                ? `${testCountry} Test (${uploadDate})` 
                : `General Upload (${uploadDate})`;
              return (
                <option key={a.id} value={a.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <Button onClick={handleRunAnalysis} disabled={isAnalyzing} size="sm">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Latest Data
            </>
          )}
        </Button>
      </div>

      {/* ── Row 1: KPI Stats Summary ─────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Campaign Health Score */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Campaign Health</CardDescription>
            <CardTitle className="text-4xl font-extrabold flex items-baseline gap-2">
              {analysis.campaignHealthScore}
              <span className="text-sm font-medium text-muted-foreground">/100</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            AI overall evaluation score
          </CardContent>
          <div className="absolute right-3 top-3 bg-blue-500/10 p-2 rounded-full">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        {/* AI Overall Decision */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Recommended Action</CardDescription>
            <CardTitle className="text-2xl font-extrabold pt-1">
              {getDecisionBadge(analysis.overallDecision)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-emerald-500" />
            Senior Media Buyer macro recommendation
          </CardContent>
        </Card>

        {/* Confidence Score */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Confidence Level</CardDescription>
            <CardTitle className="text-4xl font-extrabold flex items-baseline gap-2">
              {analysis.confidenceScore}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-purple-500" />
            AI confidence in analysis logic
          </CardContent>
        </Card>

        {/* Real Cash Net Profit */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">True Net Profit</CardDescription>
            <CardTitle className={`text-3xl font-extrabold ${businessIntel?.trueProfit && businessIntel.trueProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
              ${businessIntel?.trueProfit ? businessIntel.trueProfit.toFixed(2) : "0.00"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-green-500" />
            Calculated after call confirmation & COD delivery rates
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Business Intelligence (Cashflow Economics) ────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Business Intelligence & COD Economics
          </CardTitle>
          <CardDescription>
            Logistics margins and cash flow health (Facebook conversions vs door-step delivery realization).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Net Profit Margin</p>
              <p className="text-lg font-bold">{businessIntel?.netMargin ? `${businessIntel.netMargin.toFixed(1)}%` : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Break-even CPA (CPL)</p>
              <p className="text-lg font-bold">${businessIntel?.breakEvenCpa ? businessIntel.breakEvenCpa.toFixed(2) : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Break-even CPP</p>
              <p className="text-lg font-bold">${businessIntel?.breakEvenCpp ? businessIntel.breakEvenCpp.toFixed(2) : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Projected Monthly Profit</p>
              <p className={`text-lg font-bold ${businessIntel?.projectedMonthlyProfit && businessIntel.projectedMonthlyProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
                ${businessIntel?.projectedMonthlyProfit ? businessIntel.projectedMonthlyProfit.toFixed(2) : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Max Acceptable CPC</p>
              <p className="text-lg font-bold">${businessIntel?.maxAcceptableCpc ? businessIntel.maxAcceptableCpc.toFixed(2) : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Max Acceptable CPM</p>
              <p className="text-lg font-bold">${businessIntel?.maxAcceptableCpm ? businessIntel.maxAcceptableCpm.toFixed(2) : "N/A"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Cashflow Analysis</p>
              <p className="text-sm font-medium">{businessIntel?.cashFlow || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 3: Optimization Recommendations ──────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Optimization Actions */}
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Optimization Engine
            </CardTitle>
            <CardDescription>Direct recommendations and rationale generated from the ad data.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 space-y-4">
            {optimizationActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No specific optimization actions identified.</p>
            ) : (
              optimizationActions.map((item, idx) => (
                <div key={idx} className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="mt-0.5">
                    {item.priority === "HIGH" ? (
                      <Badge className="bg-rose-500 text-white hover:bg-rose-600 text-[10px] py-0 px-1.5 uppercase font-bold">HIGH</Badge>
                    ) : item.priority === "MEDIUM" ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] py-0 px-1.5 uppercase font-bold">MED</Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-[10px] py-0 px-1.5 uppercase font-bold">LOW</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.rationale}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Fatigue & Creative Warning Alerts */}
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Creative Fatigue & Audience Alerts
            </CardTitle>
            <CardDescription>Frequency wear-out warnings and CPC/CPM spike mitigations.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 space-y-4">
            {fatigueWarnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium">All clear! No fatigue detected.</p>
              </div>
            ) : (
              fatigueWarnings.map((warning, idx) => (
                <div key={idx} className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0">
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{warning.targetName}</span>
                      <Badge variant="outline" className="text-[10px]">Freq: {warning.frequency.toFixed(1)}x</Badge>
                    </div>
                    <p className="text-xs font-semibold text-rose-500">{warning.warningType.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Remedy:</span> {warning.remedy}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Creative rankings ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Creative Performance Rankings
          </CardTitle>
          <CardDescription>
            Performance-sorted audit of creatives based on true COD realizations, spend efficiency, and click interest.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {creativeRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">No creative analytics details generated.</p>
            ) : (
              creativeRanking.map((creative) => (
                <div key={creative.adName} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border p-4 rounded-lg bg-muted/20 gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">#{creative.rank} {creative.adName}</span>
                      <Badge className={creative.status === "WINNER" ? "bg-emerald-600 dark:bg-emerald-500 text-white" : creative.status === "LOSER" ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-secondary text-secondary-foreground"}>
                        {creative.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{creative.insights}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-sm sm:text-right flex-shrink-0">
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="font-bold">{creative.ctr.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spend</p>
                      <p className="font-bold">${creative.spend.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-bold">{creative.orders}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Row 4.5: Ad Set Performance Analysis ────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Ad Set Performance Analysis
          </CardTitle>
          <CardDescription>
            Audit of active ad sets, highlighting scalable winners and bottleneck cost centers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Winners */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Winning Targetings (Scale Signals)
            </h4>
            {winningAdSets.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-1">No ad sets have met scaling signals yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {winningAdSets.map((adSet) => (
                  <div key={adSet.adSetName} className="border p-3 rounded-md bg-emerald-500/5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs truncate max-w-[70%]">{adSet.adSetName}</span>
                      <Badge variant="outline" className="text-[9px] uppercase border-emerald-500 text-emerald-500">
                        {adSet.scalingPotential} SCALE
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Spend: <strong className="text-foreground">${adSet.spend.toFixed(0)}</strong></span>
                      <span>Orders: <strong className="text-foreground">{adSet.orders}</strong></span>
                      <span>CPP: <strong className="text-foreground">${adSet.cpp.toFixed(1)}</strong></span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic"><strong className="text-foreground font-semibold">Reason:</strong> {adSet.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Losers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              Underperforming Targetings (Pause Signals)
            </h4>
            {losingAdSets.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-1">No major bottleneck ad sets flagged.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {losingAdSets.map((adSet) => (
                  <div key={adSet.adSetName} className="border p-3 rounded-md bg-rose-500/5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs truncate max-w-[70%]">{adSet.adSetName}</span>
                      <Badge className="bg-rose-500 text-white hover:bg-rose-600 text-[9px] uppercase">PAUSE</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Spent: <strong className="text-foreground">${adSet.spend.toFixed(0)}</strong></span>
                      <span>Orders: <strong className="text-foreground">{adSet.orders}</strong></span>
                      <span>CPP: <strong className="text-foreground">${adSet.cpp.toFixed(1)}</strong></span>
                    </div>
                    <p className="text-[11px] text-rose-500 font-semibold"><strong className="text-foreground font-semibold">Issue:</strong> {adSet.issue}</p>
                    <p className="text-[11px] text-muted-foreground"><strong className="text-foreground font-semibold">Fix:</strong> {adSet.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Row 5: Action Plan & Budget Roadmap ─────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Action Plan & Budget Roadmap
          </CardTitle>
          <CardDescription>AI-generated strategic steps and budget guidance for the next operational cycle.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                1. Immediate Actions (24h)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                {(actionPlan?.immediate || []).map((action, idx) => <li key={idx}>{action}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Activity className="h-4 w-4" />
                2. Monitor Closely (Next 3-7 Days)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                {(actionPlan?.monitor || []).map((action, idx) => <li key={idx}>{action}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                3. Scaling Roadmaps
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                {(actionPlan?.scaling || []).map((action, idx) => <li key={idx}>{action}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <AlertTriangle className="h-4 w-4" />
                4. Operational Risks to Mitigate
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                {(actionPlan?.risk || []).map((action, idx) => <li key={idx}>{action}</li>)}
              </ul>
            </div>
          </div>

          <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center bg-muted/20 p-4 rounded-lg gap-4">
            <div>
              <p className="text-sm font-bold">Recommended Testing Budget</p>
              <p className="text-xs text-muted-foreground">Budget allocated per day for the next campaign execution phase.</p>
            </div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 flex-shrink-0">
              ${actionPlan?.nextBudget ? actionPlan.nextBudget.toFixed(2) : "0.00"}
              <span className="text-sm font-medium text-muted-foreground">/day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
