import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectWriteData, serializeProject } from "@/lib/projects";
import { projectUpdateSchema } from "@/lib/validators";

type ProjectRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ProjectRouteProps) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: serializeProject(project) });
}

export async function PATCH(request: Request, { params }: ProjectRouteProps) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentProject = await prisma.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!currentProject) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  const parsed = projectUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid project input", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (
    user.subscription === "FREE_TRIAL" &&
    currentProject.status === "ARCHIVED" &&
    parsed.data.status === "ACTIVE"
  ) {
    const activeProjectCount = await prisma.project.count({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    const projectLimit = user.usage?.projectLimit ?? 5;

    if (activeProjectCount >= projectLimit) {
      return NextResponse.json(
        {
          message:
            "Free trial project limit reached. Archive a project before restoring this one.",
        },
        { status: 403 },
      );
    }
  }

  const project = await prisma.project.update({
    where: {
      id,
    },
    data: projectWriteData(parsed.data),
  });

  if (currentProject.status !== project.status) {
    await prisma.usage.update({
      where: {
        userId: user.id,
      },
      data: {
        activeProjectCount: await prisma.project.count({
          where: {
            userId: user.id,
            status: "ACTIVE",
          },
        }),
      },
    });
  }

  return NextResponse.json({ project: serializeProject(project) });
}

export async function DELETE(_request: Request, { params }: ProjectRouteProps) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  await prisma.usage.update({
    where: {
      userId: user.id,
    },
    data: {
      activeProjectCount: await prisma.project.count({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
      }),
    },
  });

  return NextResponse.json({ message: "Project deleted" });
}
