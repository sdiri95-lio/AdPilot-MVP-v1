const fs = require('fs');

function replace(file, find, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(find, replace);
  fs.writeFileSync(file, content);
}

function replaceGlobal(file, find, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(find).join(replace);
  fs.writeFileSync(file, content);
}

// 1. lib/timeline.ts
replace('lib/timeline.ts', 'metadata?: any;', 'metadata?: Record<string, unknown>;');

// 2. lib/import-score.ts
replace('lib/import-score.ts', 'breakdown: any;', 'breakdown: Record<string, number>;');
replace('lib/import-score.ts', 'const breakdown: any = {};', 'const breakdown: Record<string, number> = {};');

// 3. components/projects/TestingPipelineView.tsx
replace('components/projects/TestingPipelineView.tsx', 'const payload: any = { status: targetStatus };', 'const payload: { status: string; failureReason?: string } = { status: targetStatus };');

// 4. components/os/OSDashboardClient.tsx
replaceGlobal('components/os/OSDashboardClient.tsx', 'type ProjectWithTests = any;', 'type ProjectWithTests = { id: string, productName: string, category: string | null, researchScore: number | null, researchStatus: string, mediaBuyingTests?: { id: string, status: string, country: string, dailyBudget: { toString: () => string } | null }[] };');
replaceGlobal('components/os/OSDashboardClient.tsx', '(t: any)', '(t: { id: string; status: string; country: string; dailyBudget: { toString: () => string } | null })');
replaceGlobal('components/os/OSDashboardClient.tsx', 'test: any', 'test: { id: string; status: string; country: string; dailyBudget: { toString: () => string } | null; projectName: string }');
replaceGlobal('components/os/OSDashboardClient.tsx', 'icon: any', 'icon: React.ElementType');
replaceGlobal('components/os/OSDashboardClient.tsx', 'items: any[]', 'items: { id: string, productName: string, researchScore: number | null }[]');

// 5. app/(dashboard)/projects/[id]/import/page.tsx
replace('app/(dashboard)/projects/[id]/import/page.tsx', 'const kpi: any = u.kpiSummary;', 'const kpi = u.kpiSummary as { orders?: number; spend?: number; };');

// 6. app/(dashboard)/projects/[id]/expansion/page.tsx
replace('app/(dashboard)/projects/[id]/expansion/page.tsx', 'const kpi: any = u.kpiSummary;', 'const kpi = u.kpiSummary as { spend?: number; revenue?: number; };');

// 7. Unused vars
replace('app/(dashboard)/os/countries/page.tsx', 'import { redirect } from "next/navigation";', '');
replace('app/(dashboard)/os/pipeline/page.tsx', 'import { redirect } from "next/navigation";', '');
replace('app/(dashboard)/projects/[id]/import/page.tsx', 'import { Progress } from "@/components/ui/progress";', '');
replace('components/projects/ProductDatabaseView.tsx', 'import { ExternalLink } from "lucide-react";', '');
replace('components/projects/ProductDatabaseView.tsx', 'const { id, userId, createdAt, updatedAt, ...formProject } = project;', 'const { id: _id, userId: _uId, createdAt: _c, updatedAt: _u, ...formProject } = project;');

console.log('Lint issues fixed.');
