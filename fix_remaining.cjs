const fs = require('fs');
let code = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// The scale block in AgreementStudio is:
// <div className="flex items-center gap-2 mt-2">
// <span className="text-[10px] font-bold text-neutral-600">SCALE: {logoImageScale}%</span>
// <input type="range" min="20" max="300" value={logoImageScale} onChange={(e) => setLogoImageScale(Number(e.target.value))} className="w-full h-1 bg-neutral-200" />
// </div>
code = code.replace(/<div className="flex items-center gap-2 mt-2">[\s\S]*?<\/div>/g, (match) => {
  if (match.includes("logoImageScale")) return "";
  return match;
});

// Remove any remaining `logoImageScale` references in JSX
code = code.replace(/\{logoImageScale\}/g, '');

fs.writeFileSync('src/components/AgreementStudio.tsx', code);

// Now for Invoices.tsx
let inv = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');
// <div className="mt-4 border-t border-neutral-200 pt-4"> ... SCALE ... </div>
inv = inv.replace(/<div className="flex items-center justify-between mt-3">[\s\S]*?<\/div>/g, (match) => {
  if (match.includes("logoImageScale")) return "";
  return match;
});

inv = inv.replace(/<div className="mt-1">[\s\S]*?<\/div>/g, (match) => {
  if (match.includes("logoImageScale")) return "";
  return match;
});

inv = inv.replace(/<span className="text-\[9px\] font-bold text-neutral-600">\{logoImageScale\}%<\/span>/g, '');
inv = inv.replace(/value=\{logoImageScale\}/g, '');
fs.writeFileSync('src/pages/Invoices.tsx', inv);

console.log("Done");
