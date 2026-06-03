import { ProjectNav } from "@/components/projects/ProjectNav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Route } from "next";

type ProjectLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button asChild size="icon" variant="ghost">
          <Link href={"/dashboard" as Route}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-normal">Project Settings</h1>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <ProjectNav projectId={id} />
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
