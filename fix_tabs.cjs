const fs = require('fs');
let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

content = content.replace(
  /className=\{\`flex-1 min-w-\[70px\] sm:flex-none px-4 py-2 font-headline font-bold text-\[10px\] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 \$\{/g,
  `className={\`flex-1 sm:flex-none px-2 sm:px-5 py-3 font-headline font-bold text-[9px] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 \${`
);

fs.writeFileSync('src/pages/Sessions.tsx', content);
