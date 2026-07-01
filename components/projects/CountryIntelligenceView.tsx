"use client";

import { useState } from "react";
import { Loader2, Globe2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type CountryIntelligence = {
  country: string;
  totalTests: number;
  winners: number;
  winRate: number;
  avgRoas: number;
  avgCpp: number;
  winningCategories: string[];
  notes: string;
};

export function CountryIntelligenceView({ intelligence }: { intelligence: CountryIntelligence[] }) {
  const [savingCountry, setSavingCountry] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(
    intelligence.reduce<Record<string, string>>((acc, curr) => ({ ...acc, [curr.country]: curr.notes }), {})
  );
  const { toast } = useToast();

  const handleSaveNotes = async (country: string) => {
    setSavingCountry(country);
    try {
      const res = await fetch("/api/os/countries/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, notes: notes[country] || "" }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Notes Saved", description: `Updated manual notes for ${country}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save country notes." });
    } finally {
      setSavingCountry(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Country Intelligence</h2>
          <p className="text-sm text-muted-foreground">Dynamic insights generated from historical media buying tests.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {intelligence.map(stat => (
          <Card key={stat.country}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex justify-between items-center text-lg">
                <span className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-blue-500" /> {stat.country}</span>
                <Badge variant={stat.winRate >= 50 ? "default" : "secondary"}>{stat.winRate.toFixed(0)}% Win Rate</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Total Tests</p>
                  <p className="font-bold text-lg">{stat.totalTests}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Winning Products</p>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">{stat.winners}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Avg ROAS</p>
                  <p className="font-medium">{stat.avgRoas > 0 ? stat.avgRoas.toFixed(2) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Avg CPP</p>
                  <p className="font-medium">{stat.avgCpp > 0 ? `$${stat.avgCpp.toFixed(2)}` : "N/A"}</p>
                </div>
              </div>

              {stat.winningCategories.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Top Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {stat.winningCategories.map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Manual Market Notes</p>
                <Textarea 
                  placeholder="COD issues, courier reliability, seasonality..."
                  className="min-h-[100px] text-sm"
                  value={notes[stat.country] || ""}
                  onChange={(e) => setNotes(prev => ({ ...prev, [stat.country]: e.target.value }))}
                />
                <Button 
                  size="sm" 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleSaveNotes(stat.country)}
                  disabled={savingCountry === stat.country}
                >
                  {savingCountry === stat.country ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {intelligence.length === 0 && (
          <p className="text-muted-foreground">No test data available to generate country intelligence.</p>
        )}
      </div>
    </div>
  );
}
