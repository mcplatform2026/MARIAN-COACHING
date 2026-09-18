const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-row justify-between pt-6 pb-6 w-full" style=\{\{ fontSize: "18px" \}\}>/g,
  '<div className="grid grid-cols-2 pt-6 pb-6" style={{ fontSize: "18px" }}>'
);
code = code.replace(
  /className="flex flex-row w-full py-2 border-t-\[3px\] border-b-\[3px\] font-headline font-bold tracking-widest uppercase"/g,
  'className="grid grid-cols-12 py-2 border-t-[3px] border-b-[3px] font-headline font-bold tracking-widest uppercase"'
);
code = code.replace(
  /<div className="w-\[83\.333333%\] text-left">\n\s*DESCRIPTION/g,
  '<div className="col-span-10 text-left">\n                      DESCRIPTION'
);
code = code.replace(
  /<div className="w-\[16\.666667%\] text-right">\n\s*PRICE/g,
  '<div className="col-span-2 text-right">\n                      PRICE'
);
code = code.replace(
  /className=\{`flex flex-row w-full \$\{items\.length > 6 \? 'py-1\.5' : items\.length > 4 \? 'py-2' : items\.length > 3 \? 'py-2\.5' : 'py-3\.5'\} leading-tight items-start`\}/g,
  "className={`grid grid-cols-12 ${items.length > 6 ? 'py-1.5' : items.length > 4 ? 'py-2' : items.length > 3 ? 'py-2.5' : 'py-3.5'} leading-tight items-start`}"
);
code = code.replace(
  /<div className="w-\[83\.333333%\] pr-4 flex items-center">/g,
  '<div className="col-span-10 pr-4 flex items-center">'
);
code = code.replace(
  /<div className="w-\[16\.666667%\] text-right font-headline font-black whitespace-nowrap"/g,
  '<div className="col-span-2 text-right font-headline font-black whitespace-nowrap"'
);
code = code.replace(
  /<div className="flex flex-row w-full gap-4 items-end mt-4">/g,
  '<div className="grid grid-cols-12 gap-4 items-end mt-4">'
);
code = code.replace(
  /<div className="w-\[66\.666667%\] text-left leading-relaxed pr-2 space-y-4">/g,
  '<div className="col-span-8 text-left leading-relaxed pr-2 space-y-4">'
);
code = code.replace(
  /<div className="w-\[33\.333333%\] text-right flex flex-col items-end justify-end">/g,
  '<div className="col-span-4 text-right flex flex-col items-end justify-end">'
);

fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Reverted Invoices.tsx');
