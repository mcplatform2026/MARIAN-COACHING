const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

code = code.replace("const docRef = doc(db, \\`users/\\${uid}/invoices/\\${id}\\`);", "const docRef = doc(db, `users/${uid}/invoices/${id}`);");

code = code.replace(/pdf\.save\(\\`invoice_\\\$[\s\S]*?\\.pdf\\`\)/, 'pdf.save(`invoice_${invoiceNoStr}.pdf`);');

code = code.replace(/style=\{\{ transform: \\`scale\(\\\$\{\(invoice\.signatureImageScale \|\| 100\) \/ 100\}\)\\` \}\}/g, 'style={{ transform: `scale(${(invoice.signatureImageScale || 100) / 100})` }}');

code = code.replace(/alert\(\\`Failed to download PDF: \\\$\{\(err instanceof Error \? err\.message : 'Unknown error'\)\}\\`\)/g, 'alert(`Failed to download PDF: ${err instanceof Error ? err.message : \'Unknown error\'}`);');

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Fixed backticks');
