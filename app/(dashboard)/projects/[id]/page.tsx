import { ProjectDetail } from "@/components/projects/ProjectDetail";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-medium">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Update saved product inputs or archive the project from the dashboard.
        </p>
      </div>
      <ProjectDetail projectId={id} />
    </div>
  );
}
