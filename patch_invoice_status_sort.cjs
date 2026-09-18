const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const statusLogic = `                const sorted = [...updated].sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.invoiceDate).getTime() || 0;
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.invoiceDate).getTime() || 0;
          return timeB - timeA;
        });`;

const newStatusLogic = `                const sorted = [...updated].sort((a, b) => {
          const getSortTime = (inv: any) => {
            if (typeof inv.createdAt === 'number') return inv.createdAt;
            if (typeof inv.createdAt === 'string') return new Date(inv.createdAt).getTime();
            return 0;
          };
          return getSortTime(b) - getSortTime(a);
        });`;

code = code.replace(statusLogic, newStatusLogic);

fs.writeFileSync('src/pages/Invoices.tsx', code);
