import { ProjectList } from "@/components/projects/ProjectList";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-primary">Project workspace</p>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Dashboard
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Manage product test ideas, image assets, and market inputs before
          analysis begins.
        </p>
      </section>

      <ProjectList />
    </div>
  );
}
