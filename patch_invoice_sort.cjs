const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const sortLogic = `const timeA = typeof a.createdAt === 'number' ? a.createdAt : parseDDMMYYYY(a.invoiceDate)?.getTime() || 0;
            const timeB = typeof b.createdAt === 'number' ? b.createdAt : parseDDMMYYYY(b.invoiceDate)?.getTime() || 0;
            return timeB - timeA;`;

const newSortLogic = `const getSortTime = (inv: any) => {
              if (typeof inv.createdAt === 'number') return inv.createdAt;
              if (typeof inv.createdAt === 'string') return new Date(inv.createdAt).getTime();
              // fallback
              if (inv.invoiceDate) {
                const parts = inv.invoiceDate.split('/');
                if (parts.length === 3) {
                  return new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}\`).getTime();
                }
                return new Date(inv.invoiceDate).getTime();
              }
              return 0;
            };
            return getSortTime(b) - getSortTime(a);`;

code = code.replace(sortLogic, newSortLogic);
// Oh wait, there are two sort logics (one in loadInvoices, one in handleToggleInvoiceStatus).

fs.writeFileSync('src/pages/Invoices.tsx', code);
