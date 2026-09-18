const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const oldSort = `        const sorted = [...updated].sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.invoiceDate).getTime() || 0;
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.invoiceDate).getTime() || 0;
          return timeB - timeA;
        });`;

const newSort = `        const sorted = sortInvoicesDesc(updated);`;

code = code.replace(oldSort, newSort);

fs.writeFileSync('src/pages/Invoices.tsx', code);
