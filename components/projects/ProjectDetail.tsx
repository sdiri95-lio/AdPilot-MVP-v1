"use client";

import { useEffect, useState } from "react";

import { ProjectForm } from "@/components/projects/ProjectForm";
import type { ProjectResponse } from "@/lib/validators";
import type { ProjectDetailResponse } from "@/types/api";

type ProjectDetailProps = {
  projectId: string;
};

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);

      if (response.status === 404) {
        setError("Project not found.");
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as ProjectDetailResponse & {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Unable to load project.");
        setIsLoading(false);
        return;
      }

      setProject(payload.project);
      setIsLoading(false);
    }

    void loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">
        Loading project...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return <ProjectForm project={project} />;
}
