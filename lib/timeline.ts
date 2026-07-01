import { prisma } from "./prisma";

export async function logTimelineEvent({
  projectId,
  eventType,
  title,
  description,
  metadata
}: {
  projectId: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.projectTimelineEvent.create({
      data: {
        projectId,
        eventType,
        title,
        description,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    });
  } catch (err) {
    console.error("Failed to log timeline event:", err);
  }
}
