const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
code = code.replace(
  /\{session\.rate !== undefined && \(\s*<p className="font-numbers font-bold text-xs text-neutral-800 ml-auto">\s*\{currency\}\{session\.rate\.toLocaleString\(\)\}\s*<\/p>\s*\)\}/g,
  ''
);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Removed price from dashboard.');
