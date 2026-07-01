import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/ProjectList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in" as Route);
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    productName: p.productName,
    productCost: p.productCost.toNumber(),
    sellingPrice: p.sellingPrice.toNumber(),
    shippingCost: p.shippingCost.toNumber(),
    serviceFee: p.serviceFee.toNumber(),
    targetCountry: p.targetCountry,
    productUrl: p.productUrl,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
          Command Terminal
        </h1>
        <p className="text-sm text-zinc-400">
          Welcome to AdPilot Africa. Run deep intelligence queries on your inventory and campaigns.
        </p>
      </div>

      <ProjectList initialProjects={serializedProjects} />
    </div>
  );
}
