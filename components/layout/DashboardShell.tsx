import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen lg:pl-64">
        <Header />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
