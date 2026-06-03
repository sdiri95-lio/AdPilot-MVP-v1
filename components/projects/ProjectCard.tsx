"use client";

import { Archive, ExternalLink, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import type { ProjectResponse } from "@/lib/validators";

type ProjectCardProps = {
  project: ProjectResponse;
  onChanged: () => void;
};

export function ProjectCard({ project, onChanged }: ProjectCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(status: "ACTIVE" | "ARCHIVED") {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payload = await response.json();
        window.alert(payload.message ?? "Unable to update project.");
        return;
      }

      onChanged();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProject() {
    if (!window.confirm("Delete this project permanently?")) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        window.alert(payload.message ?? "Unable to delete project.");
        return;
      }

      onChanged();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {project.imageUrl ? (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.imageUrl})` }}
        />
      ) : null}
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">{project.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {project.productName}
            </p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Country</dt>
            <dd className="font-medium">{project.targetCountry ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-medium">
              {project.productType?.replace("_", " ") ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cost</dt>
            <dd className="font-medium">${project.productCost}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-medium">${project.sellingPrice}</dd>
          </div>
        </dl>

        {(project.mediaBuyerReport || project.winningProbability || project.marginPercent) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {project.mediaBuyerReport && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                Analyzed
              </span>
            )}
            {project.winningProbability && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                {project.winningProbability}% Win Prob
              </span>
            )}
            {project.marginPercent && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-400">
                {project.marginPercent}% Margin
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/projects/${project.id}` as Route}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {project.productUrl ? (
            <Button asChild size="sm" variant="ghost">
              <a href={project.productUrl} rel="noreferrer" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                Product
              </a>
            </Button>
          ) : null}
          {project.status === "ACTIVE" ? (
            <Button
              disabled={isSaving}
              onClick={() => updateStatus("ARCHIVED")}
              size="sm"
              variant="ghost"
            >
              <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
              Archive
            </Button>
          ) : (
            <Button
              disabled={isSaving}
              onClick={() => updateStatus("ACTIVE")}
              size="sm"
              variant="ghost"
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restore
            </Button>
          )}
          <Button
            disabled={isSaving}
            onClick={deleteProject}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
