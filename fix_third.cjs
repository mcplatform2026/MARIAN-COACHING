const fs = require('fs');
let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');

code = code.replace(
  /<div className="border-2 border-black text-white p-3"/g,
  '<div className="w-[32%] border-2 border-black text-white p-3"'
);

fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Fixed 3rd col');
