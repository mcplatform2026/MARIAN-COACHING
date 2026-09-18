const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

code = code.replace('const docRef = doc(db, "users/" + uid + "/invoices/" + id);', 'const docRef = doc(db, "users/" + uid + "/agreements/inv_" + id);');

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Patched InvoiceView path');
