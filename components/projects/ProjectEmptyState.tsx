import { FolderPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ProjectEmptyStateProps = {
  isArchivedView: boolean;
  hasSearch: boolean;
};

export function ProjectEmptyState({
  isArchivedView,
  hasSearch,
}: ProjectEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-8 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FolderPlus className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {hasSearch
              ? "No matching projects"
              : isArchivedView
                ? "No archived projects"
                : "No active projects yet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasSearch
              ? "Adjust the search term or switch filters."
              : isArchivedView
                ? "Archived projects will appear here when you move them out of your active workspace."
                : "Create your first project to save product inputs and prepare for analysis later."}
          </p>
        </div>
        {!isArchivedView && !hasSearch ? (
          <Button asChild>
            <Link href="/projects/new">Create project</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
