const fs = require('fs');
let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

content = content.replace(
  /<div className="flex flex-wrap border-2 border-black bg-surface-container-lowest overflow-hidden mx-auto lg:mx-0 w-full sm:w-auto">/g,
  `<div className="flex flex-nowrap overflow-x-auto hide-scrollbar border-2 border-black bg-surface-container-lowest mx-auto lg:mx-0 w-full sm:w-auto">`
);

content = content.replace(
  /className=\{\`flex-1 sm:flex-none px-4 py-3 font-headline font-bold text-\[10px\] sm:text-xs uppercase tracking-wide border-black sm:border-b-0 border-b-2 sm:last:border-b-0 last:border-b-0 last:border-r-0 border-r-2 \$\{/g,
  `className={\`whitespace-nowrap flex-none px-6 py-3 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 \${`
);

fs.writeFileSync('src/pages/Sessions.tsx', content);
