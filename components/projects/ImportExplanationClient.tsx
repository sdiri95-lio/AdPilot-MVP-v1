"use client";

import { useState } from "react";
import { Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ImportExplanationAiResult } from "@/lib/ai/schemas";

type ExplanationPayload = {
  productName: string;
  importScore: number;
  decisionThreshold: string;
  moq: number;
  leadTime: number;
  capitalRequired: number;
  countriesWon: number;
  avgDeliveryRate: number;
  avgTrueProfit: number;
};

export function ImportExplanationClient({ payload }: { payload: ExplanationPayload }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImportExplanationAiResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "import-explanation",
          data: payload
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate explanation");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" /> 
              AI Score Explanation
            </CardTitle>
            <CardDescription>Get an expert breakdown of this deterministic score.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Explain Score"}
          </Button>
        </div>
      </CardHeader>
      
      {result && (
        <CardContent className="space-y-6">
          <div className="bg-background p-4 rounded-lg border text-sm leading-relaxed">
            {result.explanation}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center">Strengths</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700 flex items-center">Weaknesses & Risks</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                {result.risks.map((r, i) => <li key={`risk-${i}`}>{r}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Recommended Next Actions</h4>
            <div className="space-y-2">
              {result.recommendedActions.map((action, i) => (
                <div key={i} className="bg-background border p-3 rounded text-sm">
                  <span className="font-bold mr-2 text-primary">#{i+1}</span> {action}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
