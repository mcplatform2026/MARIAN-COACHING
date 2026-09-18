const fs = require('fs');

let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');
code = code.replace(
  "const invoiceNoStr = typeof invoiceNo !== 'undefined' ? invoiceNo : 'report';",
  ""
);
code = code.replace(
  "const filename = element.id.includes('invoice') ? `invoice_${invoiceNoStr}.pdf` : `Monthly_Report.pdf`;",
  "const filename = `Monthly_Report_${typeof selectedMonth !== 'undefined' ? selectedMonth : ''}_${typeof selectedYear !== 'undefined' ? selectedYear : ''}.pdf`;"
);

fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Fixed filename issue in MonthlyReport.tsx');
