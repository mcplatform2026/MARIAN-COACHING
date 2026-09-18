const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const helperCode = `
const sortInvoicesDesc = (invoices: SavedInvoice[]): SavedInvoice[] => {
  return [...invoices].sort((a, b) => {
    const getDateVal = (inv: SavedInvoice) => {
      if (!inv.invoiceDate) return 0;
      let d = new Date(inv.invoiceDate);
      if (isNaN(d.getTime())) {
        const parts = inv.invoiceDate.split('/');
        if (parts.length === 3) {
          d = new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}\`);
        }
      }
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    
    const dateA = getDateVal(a);
    const dateB = getDateVal(b);
    
    if (dateA !== dateB) {
      return dateB - dateA; // Newest invoiceDate first
    }
    
    const getCreatedTime = (inv: SavedInvoice) => {
      if (typeof inv.createdAt === 'number') return inv.createdAt;
      if (typeof inv.createdAt === 'string') return new Date(inv.createdAt).getTime();
      return 0;
    };
    
    return getCreatedTime(b) - getCreatedTime(a);
  });
};
`;

if (!code.includes("const sortInvoicesDesc =")) {
  code = code.replace("export function Invoices() {", helperCode + "\nexport function Invoices() {");
}

fs.writeFileSync('src/pages/Invoices.tsx', code);
