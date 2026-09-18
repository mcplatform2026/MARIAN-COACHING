const fs = require('fs');
let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-row justify-between w-full gap-3\.5 mb-10">/g,
  '<div className="grid grid-cols-3 gap-3.5 mb-10">'
);
code = code.replace(
  /<div className="w-\[32%\] border-2 border-black bg-neutral-50 p-3">/g,
  '<div className="border-2 border-black bg-neutral-50 p-3">'
);
code = code.replace(
  /<div className="w-\[32%\] border-2 border-black text-white p-3"/g,
  '<div className="border-2 border-black text-white p-3"'
);

fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Reverted MonthlyReport.tsx');
