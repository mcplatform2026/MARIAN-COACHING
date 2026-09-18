const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const formatFunc = `  const formatDateForPDF = (dateStr: string) => {
    if (!dateStr) return "";
    
    // Convert dd/mm/yy or yyyy-mm-dd into Date
    let d = new Date(dateStr);
    
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        let year = parseInt(parts[2], 10);
        // Handle 2 digit year
        if (year < 100) year += 2000;
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[0], 10);
        d = new Date(year, month, day);
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        d = new Date(year, month, day);
      }
    }
    
    if (isNaN(d.getTime())) return dateStr;
    
    const day = d.getDate();
    const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                   (day % 10 === 2 && day !== 12) ? 'nd' :
                   (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    
    return \`\${day}\${suffix} \${month} \${year}\`;
  };`;

// Insert after formatDisplayDate
const target = '  const formatDisplayDate = (dStr: string) => {';
if (code.includes(target)) {
  code = code.replace(target, formatFunc + '\\n\\n' + target);
}

// Replace formatDisplayDate(invoiceDate) inside the PDF view
const oldPdfDate = `{formatDisplayDate(invoiceDate)}`;
// We need to replace it *only* in the PDF view, which is below line 1709
// Let's use string replace on the exact text block
const targetBlock = `<p className="font-headline font-bold tracking-tight" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "17px" }}>
                        {formatDisplayDate(invoiceDate)}
                      </p>`;
const replacementBlock = `<p className="font-headline font-bold tracking-tight" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "17px" }}>
                        {formatDateForPDF(invoiceDate)}
                      </p>`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replacementBlock);
}

fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Done');
