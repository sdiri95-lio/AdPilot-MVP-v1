import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { TimelineLogger } from "@/components/projects/TimelineLogger";

export default async function ProjectTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      timelineEvents: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Timeline</h2>
          <p className="text-muted-foreground">The historical memory of {project.productName}.</p>
        </div>
        <TimelineLogger projectId={project.id} />
      </div>

      <div className="relative border-l border-muted-foreground/20 ml-3 pl-6 space-y-8 py-4">
        {project.timelineEvents.map((event) => (
          <div key={event.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
              {event.metadata && (
                <div className="mt-2 text-xs bg-muted/50 p-2 rounded-md font-mono text-muted-foreground break-all">
                  {JSON.stringify(event.metadata)}
                </div>
              )}
            </div>
          </div>
        ))}

        {project.timelineEvents.length === 0 && (
          <div className="text-sm text-muted-foreground italic">No historical events recorded yet.</div>
        )}
      </div>
    </div>
  );
}
