import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
              <BrainCircuit className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
                AdPilot
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider ml-1 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                Africa
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors mr-2"
            >
              All Projects
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverCard: "bg-zinc-900 border border-zinc-800 text-white shadow-xl",
                  userButtonTrigger: "focus:ring-2 focus:ring-indigo-500",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
