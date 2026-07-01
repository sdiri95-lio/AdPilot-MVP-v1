"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function TimelineLogger({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLog = async () => {
    if (!actionType) return;
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/projects/${projectId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "SCALING_ACTION",
          title: `Scale Action: ${actionType.replace(/_/g, ' ')}`,
          description,
          metadata: { actionType }
        })
      });

      if (!res.ok) throw new Error("Failed to log scaling action");
      
      setIsOpen(false);
      setActionType("");
      setDescription("");
      router.refresh();
      toast({ title: "Scaling action logged successfully" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to log action." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Log Scaling Action</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Operational Action</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger><SelectValue placeholder="Select scaling action..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget Increase">Budget Increase</SelectItem>
                <SelectItem value="Campaign Duplication">Campaign Duplication</SelectItem>
                <SelectItem value="New Creative Test">New Creative Test</SelectItem>
                <SelectItem value="New Offer Test">New Offer Test</SelectItem>
                <SelectItem value="New Country Launch">New Country Launch</SelectItem>
                <SelectItem value="Landing Page Optimization">Landing Page Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description / Notes</Label>
            <Textarea 
              placeholder="e.g. Duplicated winning CBO 3 times, increased budget by 20% on ABO..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!actionType || isLoading} onClick={handleLog}>Save Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
