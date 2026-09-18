const fs = require('fs');

// 1. AgreementStudio
let code = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// Remove state
code = code.replace(/const \[logoImageScale, setLogoImageScale\] = useState[^\;]+\;/g, '');

// Remove from dependencies
code = code.replace(/,\s*logoImageScale\b/g, '');

// Remove from onSave / handleSave logic
// It might be in an object: logoImageScale,
code = code.replace(/logoImageScale,\n/g, '');

// Remove the scale UI block
// <div className="flex items-center gap-2 mt-2"> ... SCALE: ... <input type="range" ... /> </div>
code = code.replace(/<div className="flex items-center gap-2 mt-2">\s*<span className="text-\[10px\][^>]+>SCALE:[^<]+<\/span>\s*<input type="range"[^>]+logoImageScale[^>]+>\s*<\/div>/g, '');

// Remove from the logo display in preview: 
// <div style={{ width: `${(logoImageScale || 100) * 1.6}px`, display: 'flex', justifyContent: 'flex-start' }}>
// replace with a standard size div
code = code.replace(/<div style=\{\{\s*width:\s*`\$\{\(logoImageScale \|\| 100\) \* 1\.6\}px`[^}]+}}>/g, '<div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>');
// replace with a standard size div
code = code.replace(/<div style=\{\{\s*width:\s*`\$\{\(logoImageScale \|\| 100\) \* [0-9\.]+?\}px`[^}]+}}>/g, '<div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>');


fs.writeFileSync('src/components/AgreementStudio.tsx', code);


// 2. AgreementView.tsx & DocumentView.tsx
['src/pages/AgreementView.tsx', 'src/pages/DocumentView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<div style=\{\{\s*width:\s*`\$\{\([a-zA-Z\.]*?logoImageScale \|\| 100\) \* [0-9\.]+?\}px`[^}]+}}>/g, '<div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>');
  fs.writeFileSync(file, content);
});

// 3. Invoices.tsx
let inv = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Remove logoImageScale state
inv = inv.replace(/const \[logoImageScale, setLogoImageScale\] = useState[^\;]+\;/g, '');

// Remove from setLogoImageScale calls
inv = inv.replace(/setLogoImageScale\([^)]+\);/g, '');

// Remove from dependencies
inv = inv.replace(/,\s*logoImageScale\b/g, '');

// Remove from save objects
inv = inv.replace(/logoImageScale,/g, '');

// Remove logo scale UI 
inv = inv.replace(/<div className="flex items-center justify-between mt-3">\s*<span className="text-\[9px\][^>]+>SCALE<\/span>\s*<span className="text-\[9px\][^>]+>\{logoImageScale\}%<\/span>\s*<\/div>\s*<div className="mt-1">\s*<input[^>]+logoImageScale[^>]+>\s*<\/div>/g, '');

// Fix logo usage in Invoices.tsx
inv = inv.replace(/<div style=\{\{\s*width:\s*`\$\{\([a-zA-Z\.]*?logoImageScale \|\| 100\) \* [0-9\.]+?\}px`[^}]+}}>/g, '<div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>');

// Fix signature scale in Invoices.tsx
// Old: width: `${(signatureImageScale || 100) * 0.8}px`, maxHeight: '60px',
// We need to remove the maxHeight constraint
inv = inv.replace(/maxHeight:\s*'60px',/g, '');

fs.writeFileSync('src/pages/Invoices.tsx', inv);

console.log("Done");
