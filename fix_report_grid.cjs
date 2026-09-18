const fs = require('fs');
let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');

// Replace grid grid-cols-3
code = code.replace(
  /<div className="grid grid-cols-3 gap-3\.5 mb-10">/g,
  '<div className="flex flex-row justify-between w-full gap-3.5 mb-10">'
);

// We also need to add w-[32%] to each child. Let's see the child elements.
// I will just let gap-3.5 handle it, but wait, if it's flex, children will shrink if they don't have flex-1. Let's use w-1/3 roughly.
// Actually, they are:
// <div className="border-2 border-black bg-neutral-50 p-3">
code = code.replace(
  /<div className="border-2 border-black bg-neutral-50 p-3">/g,
  '<div className="w-[32%] border-2 border-black bg-neutral-50 p-3">'
);

fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Fixed grid in MonthlyReport.tsx');
