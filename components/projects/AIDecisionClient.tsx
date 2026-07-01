"use client";

import { useState } from "react";
import { Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { TestDecisionAiResult } from "@/lib/ai/schemas";

type TestData = {
  id: string;
  country: string;
  status: string;
  spend: number;
  orders: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpp: number;
  deliveryRate: number;
  trueProfit: number;
};

export function AIDecisionClient({ 
  project, 
  tests,
  timelineEvents 
}: { 
  project: { id: string, productName: string },
  tests: TestData[],
  timelineEvents: { title: string, description: string | null }[] 
}) {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(tests.length > 0 ? tests[0].id : null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TestDecisionAiResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedTestId) return;
    const test = tests.find(t => t.id === selectedTestId);
    if (!test) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "test-decision",
          data: {
            productName: project.productName,
            country: test.country,
            spend: test.spend,
            orders: test.orders,
            roas: test.roas,
            ctr: test.ctr,
            cpc: test.cpc,
            cpp: test.cpp,
            deliveryRate: test.deliveryRate,
            trueProfit: test.trueProfit,
            timelineEvents: timelineEvents.slice(0, 10) // Pass recent context
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate decision");
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

  const selectedTest = tests.find(t => t.id === selectedTestId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Test for Analysis</CardTitle>
          <CardDescription>Choose a media buying test to analyze performance metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tests.map(test => (
              <Button 
                key={test.id} 
                variant={selectedTestId === test.id ? "default" : "outline"}
                onClick={() => setSelectedTestId(test.id)}
              >
                {test.country} <Badge className="ml-2" variant="secondary">{test.status}</Badge>
              </Button>
            ))}
            {tests.length === 0 && <p className="text-sm text-muted-foreground">No tests available.</p>}
          </div>
        </CardContent>
      </Card>

      {selectedTest && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Decision Engine</CardTitle>
                <CardDescription>Analyzing {selectedTest.country} Test</CardDescription>
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Run AI Analysis
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!result && !isGenerating && (
              <div className="text-center py-12 text-muted-foreground">
                <BrainCircuit className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>Click &quot;Run AI Analysis&quot; to get expert operational guidance.</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p>Analyzing metrics, COD cashflow, and historical scale...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Decision</span>
                    <span className="text-4xl font-bold">{result.decision}</span>
                  </div>
                  <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Confidence</span>
                    <span className="text-4xl font-bold">{result.confidenceScore}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Reasoning</h3>
                  <p className="text-muted-foreground leading-relaxed">{result.reasoning}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="font-semibold text-lg flex items-center text-primary">
                    <ArrowRightIcon className="mr-2 h-5 w-5" /> Recommended Next Action
                  </h3>
                  <p className="font-medium text-lg bg-primary/10 p-4 rounded-lg text-primary-foreground border border-primary/20">{result.nextAction}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
