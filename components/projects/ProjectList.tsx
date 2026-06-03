"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectEmptyState } from "@/components/projects/ProjectEmptyState";
import type { ProjectResponse } from "@/lib/validators";
import type { ProjectsListResponse } from "@/types/api";

type ProjectFilter = "ACTIVE" | "ARCHIVED";

export function ProjectList() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>("ACTIVE");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ProjectsListResponse["usage"] | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      status: filter,
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    try {
      const response = await fetch(`/api/projects?${params.toString()}`);
      const payload = (await response.json()) as ProjectsListResponse & {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Unable to load projects.");
        return;
      }

      setProjects(payload.projects);
      setUsage(payload.usage);
    } catch {
      setError("Unable to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProjects();
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [loadProjects]);

  const isArchivedView = filter === "ARCHIVED";
  const hasSearch = Boolean(search.trim());

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search projects"
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects, products, or countries"
            value={search}
          />
        </div>
        <div className="flex rounded-md border bg-card p-1">
          <Button
            onClick={() => setFilter("ACTIVE")}
            size="sm"
            variant={filter === "ACTIVE" ? "secondary" : "ghost"}
          >
            Active
          </Button>
          <Button
            onClick={() => setFilter("ARCHIVED")}
            size="sm"
            variant={filter === "ARCHIVED" ? "secondary" : "ghost"}
          >
            Archived
          </Button>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New project
          </Link>
        </Button>
      </div>

      {usage ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Active projects:{" "}
          <span className="font-medium text-foreground">
            {usage.activeProjectCount} / {usage.projectLimit}
          </span>{" "}
          on {usage.subscription.replace("_", " ").toLowerCase()}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">
          Loading projects...
        </div>
      ) : projects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              onChanged={loadProjects}
              project={project}
            />
          ))}
        </div>
      ) : (
        <ProjectEmptyState
          hasSearch={hasSearch}
          isArchivedView={isArchivedView}
        />
      )}
    </div>
  );
}
