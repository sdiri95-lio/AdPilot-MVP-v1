"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ProjectResponse } from "@/lib/validators";
import { cn } from "@/lib/utils";

type ProductDatabaseViewProps = {
  projectId: string;
};

const CHECKLIST_WEIGHTS: Record<string, number> = {
  solvesProblem: 20,
  dailyUse: 10,
  easyToDemonstrate: 15,
  viralPotential: 15,
  goodMargin: 20,
  lightweight: 5,
  codFriendly: 5,
  sustainableDemand: 10,
};

export function ProductDatabaseView({ projectId }: ProductDatabaseViewProps) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const payload = await response.json();
          setProject(payload.project);
        }
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setIsLoading(false);
      }
    }
    void loadProject();
  }, [projectId]);

  const handleToggle = (field: string, checked: boolean) => {
    if (!project) return;
    
    // Auto calculate score
    let newScore = project.researchScore || 0;
    const weight = CHECKLIST_WEIGHTS[field] || 0;
    
    if (checked) {
      newScore += weight;
    } else {
      newScore -= weight;
    }
    
    // Cap score between 0 and 100
    newScore = Math.max(0, Math.min(100, newScore));

    setProject({ 
      ...project, 
      [field]: checked,
      researchScore: newScore
    });
  };

  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    
    try {
      const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...updateData } = project;
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to save");
      
      const data = await response.json();
      setProject(data);
      
      toast({
        title: "Database Updated",
        description: "Your product research data has been saved.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product research.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) return <div>Project not found.</div>;

  const getScoreColor = (score: number | null | undefined) => {
    if (!score && score !== 0) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 70) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  const getScoreLabel = (score: number | null | undefined) => {
    if (!score && score !== 0) return "Needs Scoring";
    if (score >= 80) return "Strong Product";
    if (score >= 70) return "Good Product";
    if (score >= 60) return "Average Product";
    return "Weak Product";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Product Database</h2>
          <p className="text-sm text-muted-foreground">
            Manage your master product data and validation checklist.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("px-3 py-1 text-sm border", getScoreColor(project.researchScore))} variant="outline">
            {project.researchScore ?? 0}/100 — {getScoreLabel(project.researchScore)}
          </Badge>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Core Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Link</Label>
                <Input 
                  placeholder="https://aliexpress.com/..." 
                  value={project.supplierLink || ""} 
                  onChange={(e) => setProject({ ...project, supplierLink: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={project.weight?.toString() || ""} 
                  onChange={(e) => setProject({ ...project, weight: parseFloat(e.target.value) || 0 })} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Research Notes</Label>
              <Textarea 
                placeholder="Market observations, shipping times, quality concerns..." 
                className="min-h-[120px]"
                value={project.notes || ""} 
                onChange={(e) => setProject({ ...project, notes: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <Label>Research Status</Label>
              <Select 
                value={project.researchStatus} 
                onValueChange={(val: string) => setProject({ ...project, researchStatus: val as "RESEARCHING" | "READY_FOR_TEST" | "REJECTED" | "WINNER" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESEARCHING">Researching</SelectItem>
                  <SelectItem value="READY_FOR_TEST">Ready For Test</SelectItem>
                  <SelectItem value="WINNER">Winner</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Checklist</CardTitle>
            <CardDescription>Toggle criteria to calculate the Research Score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { id: "solvesProblem", label: "Solves A Problem", weight: 20 },
              { id: "dailyUse", label: "Daily Use", weight: 10 },
              { id: "easyToDemonstrate", label: "Easy To Demonstrate", weight: 15 },
              { id: "viralPotential", label: "Viral Potential", weight: 15 },
              { id: "goodMargin", label: "Good Margin", weight: 20 },
              { id: "lightweight", label: "Lightweight", weight: 5 },
              { id: "codFriendly", label: "COD Friendly", weight: 5 },
              { id: "sustainableDemand", label: "Sustainable Demand", weight: 10 },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Label htmlFor={item.id} className="cursor-pointer font-normal">
                  {item.label}
                  <span className="ml-2 text-xs text-muted-foreground">(+{item.weight})</span>
                </Label>
                <Switch 
                  id={item.id} 
                  checked={(project as Record<string, unknown>)[item.id] as boolean || false} 
                  onCheckedChange={(checked) => handleToggle(item.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
