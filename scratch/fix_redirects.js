const fs = require('fs');

function fixRedirect(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import type { Route } from "next";')) {
    content = content.replace('import { prisma }', 'import type { Route } from "next";\nimport { prisma }');
  }
  content = content.replace('redirect("/sign-in");', 'redirect("/sign-in" as Route);');
  fs.writeFileSync(file, content);
}

fixRedirect('app/(dashboard)/projects/[id]/expansion/page.tsx');
fixRedirect('app/(dashboard)/projects/[id]/import/page.tsx');
fixRedirect('app/(dashboard)/projects/[id]/timeline/page.tsx');

console.log('Redirects fixed.');
