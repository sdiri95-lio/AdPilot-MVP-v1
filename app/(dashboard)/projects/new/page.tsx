import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-normal">New project</h1>
        <p className="max-w-2xl text-muted-foreground">
          Save the product and economics inputs needed for later analysis.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
