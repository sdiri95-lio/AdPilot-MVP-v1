import { BarChart3, FolderKanban, Settings } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: Route;
  icon: typeof BarChart3;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    label: "Projects",
    href: "/",
    icon: FolderKanban,
  },
  {
    label: "Billing",
    href: "/settings/billing",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link className="text-lg font-semibold tracking-normal" href="/">
          AdPilot Africa
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
            href={item.href}
            key={item.label}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
