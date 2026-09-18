const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// 1. Insert helper function
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

// Insert after parseDDMMYYYY ends
code = code.replace(
  /const parseDDMMYYYY = \(dateStr: string\) => \{[\s\S]*?return new Date\(year, month, day\);\n  \}\n  return null;\n\};/,
  match => match + helperCode
);

// 2. Replace loadInvoices sort
code = code.replace(
  /          \/\/ Sort in descending order of creation\n          parsed\.sort\(\(a, b\) => \{[\s\S]*?return getSortTime\(b\) - getSortTime\(a\);\n          \}\);\n          setSavedInvoices\(parsed\);/,
  `          setSavedInvoices(sortInvoicesDesc(parsed));`
);

// 3. Replace handleSaveInvoice sort
code = code.replace(
  /      const getSortTime = \(inv\) => \{[\s\S]*?updatedInvoices\.sort\(\(a, b\) => getSortTime\(b\) - getSortTime\(a\)\);\n      \n      localStorage\.setItem\('pastInvoices', JSON\.stringify\(updatedInvoices\)\);/,
  `      const sorted = sortInvoicesDesc(updatedInvoices);\n      localStorage.setItem('pastInvoices', JSON.stringify(sorted));`
);

// 4. Replace handleDuplicateInvoice sort
code = code.replace(
  `    parsed.unshift(duplicatedInvoice);
    localStorage.setItem('pastInvoices', JSON.stringify(parsed));
    setSavedInvoices(parsed);`,
  `    parsed.push(duplicatedInvoice);
    const sorted = sortInvoicesDesc(parsed);
    localStorage.setItem('pastInvoices', JSON.stringify(sorted));
    setSavedInvoices(sorted);`
);

// 5. Replace handleToggleInvoiceStatus sort
code = code.replace(
  /                const sorted = \[\.\.\.updated\]\.sort\(\(a, b\) => \{[\s\S]*?return getSortTime\(b\) - getSortTime\(a\);\n        \}\);/,
  `                const sorted = sortInvoicesDesc(updated);`
);

fs.writeFileSync('src/pages/Invoices.tsx', code);
