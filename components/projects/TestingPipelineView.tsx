"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

type MediaTest = {
  id: string;
  projectId: string;
  country: string;
  launchDate: string | null;
  offer: string | null;
  creative: string | null;
  landingPage: string | null;
  dailyBudget: number | null;
  status: string;
};

const STAGES = [
  "RESEARCH",
  "READY",
  "PREPARING",
  "LAUNCHING",
  "TESTING",
  "ANALYSIS",
  "WINNER",
  "FAILED",
  "RETEST"
];

const STAGE_LABELS: Record<string, string> = {
  RESEARCH: "Research",
  READY: "Ready For Test",
  PREPARING: "Preparing Assets",
  LAUNCHING: "Launching",
  TESTING: "Testing",
  ANALYSIS: "Analysis",
  WINNER: "Winner",
  FAILED: "Failed",
  RETEST: "Retest",
};

export function TestingPipelineView({ projectId }: { projectId: string }) {
  const [tests, setTests] = useState<MediaTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({ country: "", dailyBudget: "" });
  const [pendingFailTestId, setPendingFailTestId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const { toast } = useToast();

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/media-tests`);
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTests();
  }, [projectId]);

  const handleDragStart = (e: React.DragEvent, testId: string) => {
    e.dataTransfer.setData("testId", testId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const testId = e.dataTransfer.getData("testId");
    
    if (targetStatus === "FAILED") {
      setPendingFailTestId(testId);
      return;
    }

    await executeMove(testId, targetStatus);
  };

  const executeMove = async (testId: string, targetStatus: string, reason?: string) => {
    
    // Optimistic update
    setTests(current => current.map(t => t.id === testId ? { ...t, status: targetStatus } : t));

    try {
      const payload: { status: string; failureReason?: string } = { status: targetStatus };
      if (reason) payload.failureReason = reason;

      const res = await fetch(`/api/projects/${projectId}/media-tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to move");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
      void loadTests(); // Revert
    }
  };

  const handleConfirmFail = async () => {
    if (!pendingFailTestId) return;
    await executeMove(pendingFailTestId, "FAILED", failureReason);
    setPendingFailTestId(null);
    setFailureReason("");
  };

  const handleCreateTest = async () => {
    if (!newTest.country) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/media-tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setNewTest({ country: "", dailyBudget: "" });
        void loadTests();
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to create test" });
    }
  };

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Testing Pipeline</h2>
          <p className="text-sm text-muted-foreground">Manage your media buying tests visually.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={newTest.country} onChange={e => setNewTest({ ...newTest, country: e.target.value })} placeholder="e.g. Lebanon" />
              </div>
              <div className="space-y-2">
                <Label>Daily Budget ($)</Label>
                <Input type="number" value={newTest.dailyBudget} onChange={e => setNewTest({ ...newTest, dailyBudget: e.target.value })} placeholder="50" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTest}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!pendingFailTestId} onOpenChange={(open) => !open && setPendingFailTestId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Test as Failed</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for Failure</Label>
                <Input 
                  value={failureReason} 
                  onChange={e => setFailureReason(e.target.value)} 
                  placeholder="e.g. High CPC, High Return Rate, Fatigue" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleConfirmFail} variant="destructive">Confirm Failure</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {STAGES.map(stage => {
          const stageTests = tests.filter(t => t.status === stage);
          return (
            <div 
              key={stage} 
              className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <h3 className="font-medium text-sm mb-3 text-muted-foreground px-1">{STAGE_LABELS[stage]} ({stageTests.length})</h3>
              <div className="space-y-3">
                {stageTests.map(test => (
                  <Card 
                    key={test.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, test.id)}
                    className="cursor-move hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm flex justify-between">
                        <span>{test.country}</span>
                        <span className="text-muted-foreground font-normal">${test.dailyBudget ?? 0}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-xs text-muted-foreground">Started: {test.launchDate ? new Date(test.launchDate).toLocaleDateString() : "Not Launched"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
