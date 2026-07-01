"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/lib/utils";

type ProjectNavProps = {
  projectId: string;
};

export function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      exact: true,
    },
    {
      name: "Product Analyzer",
      href: `/projects/${projectId}/analyze`,
    },
    {
      name: "Winning Probability",
      href: `/projects/${projectId}/probability`,
    },
    {
      name: "Profit Calculator",
      href: `/projects/${projectId}/profit`,
    },
    {
      name: "Research",
      href: `/projects/${projectId}/research`,
    },
    {
      name: "Testing Pipeline",
      href: `/projects/${projectId}/testing`,
    },
    {
      name: "CSV Results",
      href: `/projects/${projectId}/results`,
    },
    {
      name: "Ad Intelligence",
      href: `/projects/${projectId}/ad-intelligence`,
    },
    {
      name: "AI Decision",
      href: `/projects/${projectId}/ai-decision`,
    },
    {
      name: "Winners History",
      href: `/projects/${projectId}/winners`,
    },
    {
      name: "Country Expansion",
      href: `/projects/${projectId}/expansion`,
    },
    {
      name: "Import Decision",
      href: `/projects/${projectId}/import`,
    },
    {
      name: "Product Timeline",
      href: `/projects/${projectId}/timeline`,
    },
  ];

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            className={cn(
              "justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
