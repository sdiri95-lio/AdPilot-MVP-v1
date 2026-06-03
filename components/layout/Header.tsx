import { UserButton } from "@clerk/nextjs";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            size="icon"
            variant="ghost"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AdPilot Africa
            </p>
            <p className="text-xs text-muted-foreground">
              AI ads decision engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New project
            </Link>
          </Button>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
