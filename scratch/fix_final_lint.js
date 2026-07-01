const fs = require('fs');

function replace(file, find, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(find, replace);
  fs.writeFileSync(file, content);
}

function replaceGlobal(file, find, replaceText) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(find).join(replaceText);
  fs.writeFileSync(file, content);
}

// 1. ai-decision/page.tsx
replace('app/(dashboard)/projects/[id]/ai-decision/page.tsx', 'let spend = 0, orders = 0, clicks = 0, impressions = 0, revenue = 0;', 'let spend = 0, orders = 0, revenue = 0;');
replace('app/(dashboard)/projects/[id]/ai-decision/page.tsx', 'const cr = test.confirmationRate ? test.confirmationRate.toNumber() : 100;', '');
replace('app/(dashboard)/projects/[id]/ai-decision/page.tsx', 'const kpi = u.kpiSummary as any;', 'const kpi = u.kpiSummary as { ctr?: number; cpc?: number; };');

// 2. AIDecisionClient.tsx
replace('components/projects/AIDecisionClient.tsx', 'Click "Run AI Analysis"', 'Click &quot;Run AI Analysis&quot;');
replace('components/projects/AIDecisionClient.tsx', 'function ArrowRightIcon(props: any)', 'function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>)');

// 3. ArchiveProjectButton.tsx
replace('components/projects/ArchiveProjectButton.tsx', '} catch (err: any) {', '} catch (err) {');
replace('components/projects/ArchiveProjectButton.tsx', 'description: err.message', 'description: err instanceof Error ? err.message : "Unknown error"');

// 4. TimelineLogger.tsx
replace('components/projects/TimelineLogger.tsx', 'import { Input } from "@/components/ui/input";', '');
replace('components/projects/TimelineLogger.tsx', '} catch (err) {', '} catch {');

console.log('Final linting fixed');
