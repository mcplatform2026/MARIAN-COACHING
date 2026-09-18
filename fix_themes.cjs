const fs = require('fs');

let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');

code = code.replace(
  "const bg = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.bg || '#ffffff' : '#ffffff';",
  "const bg = '#ffffff';"
);

code = code.replace(
  "const textCol = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.text || '#000000' : '#000000';",
  "const textCol = '#000000';"
);

fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Fixed themes error in MonthlyReport');
