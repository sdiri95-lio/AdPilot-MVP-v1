"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Route } from "next";

export function ArchiveProjectButton({ projectId }: { projectId: string }) {
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this project? It will be hidden from your active dashboard.")) return;
    
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/archive`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to archive project");

      toast({ title: "Project archived successfully." });
      router.push("/os" as Route);
      router.refresh();
    } catch (err) {
      toast({ variant: "destructive", title: "Error archiving", description: err instanceof Error ? err.message : "Unknown error" });
      setIsArchiving(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleArchive} disabled={isArchiving}>
      <Archive className="mr-2 h-4 w-4" />
      {isArchiving ? "Archiving..." : "Archive Project"}
    </Button>
  );
}
