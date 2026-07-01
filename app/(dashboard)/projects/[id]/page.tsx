import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ArchiveProjectButton } from "@/components/projects/ArchiveProjectButton";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Update saved product inputs or archive the project from the dashboard.
          </p>
        </div>
        <ArchiveProjectButton projectId={id} />
      </div>
      <ProjectDetail projectId={id} />
    </div>
  );
}
