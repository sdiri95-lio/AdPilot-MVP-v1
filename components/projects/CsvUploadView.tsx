"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MediaBuyingTestSummary = {
  id: string;
  country: string;
  createdAt: string;
};

type KpiSummary = {
  spend?: number;
  revenue?: number;
  profit?: number;
  roas?: number;
  cpp?: number;
  orders?: number;
};

type CsvUploadRecord = {
  id: string;
  createdAt: string;
  kpiSummary: KpiSummary | null;
  mediaBuyingTest?: { country: string } | null;
};

export function CsvUploadView({ projectId }: { projectId: string }) {
  const [uploads, setUploads] = useState<CsvUploadRecord[]>([]);
  const [tests, setTests] = useState<MediaBuyingTestSummary[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resUploads, resTests] = await Promise.all([
        fetch(`/api/projects/${projectId}/results`),
        fetch(`/api/projects/${projectId}/media-tests`)
      ]);
      
      if (resUploads.ok) {
        const data = await resUploads.json();
        setUploads(data.uploads);
      }
      if (resTests.ok) {
        const data = await resTests.json();
        setTests(data.tests);
        if (data.tests.length > 0 && !selectedTestId) {
          setSelectedTestId(data.tests[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [projectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      
      // Basic CSV Parser
      const lines = text.split("\n").filter(l => l.trim() !== "");
      if (lines.length < 2) throw new Error("CSV is empty or invalid");
      
      const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
      const rawData = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
        return headers.reduce((acc, header, i) => {
          acc[header] = values[i] || "";
          return acc;
        }, {} as Record<string, string>);
      });

      const res = await fetch(`/api/projects/${projectId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaBuyingTestId: selectedTestId || undefined,
          rawData
        })
      });

      if (!res.ok) throw new Error("Failed to upload");
      
      toast({ title: "Success", description: "CSV uploaded and metrics calculated." });
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">CSV Results Center</h2>
          <p className="text-sm text-muted-foreground">Upload Facebook Ads export CSVs to automatically calculate performance.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Export</CardTitle>
          <CardDescription>Select a test to link this upload to, then choose your CSV file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1/3">
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Test (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific test</SelectItem>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.country} - {new Date(t.createdAt).toLocaleDateString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button asChild disabled={isUploading}>
              <label className="cursor-pointer">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Upload History</h3>
        {uploads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No uploads yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {uploads.map(u => {
              const kpi: KpiSummary = u.kpiSummary ?? {};
              return (
                <Card key={u.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                      {u.mediaBuyingTest?.country ? `${u.mediaBuyingTest.country} Test Export` : "Unlinked Export"}
                    </CardTitle>
                    <CardDescription>{new Date(u.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Spend</p>
                        <p className="font-medium">${kpi.spend?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">${kpi.revenue?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit</p>
                        <p className={`font-medium ${(kpi.profit ?? 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          ${kpi.profit?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROAS</p>
                        <p className="font-medium">{kpi.roas?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CPP</p>
                        <p className="font-medium">${kpi.cpp?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{kpi.orders || "0"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
