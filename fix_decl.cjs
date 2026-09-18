const fs = require('fs');
let code = fs.readFileSync('src/components/DataMigrationModal.tsx', 'utf8');

code = code.replace(/const \[invoices,[\s\S]*?setInvoices\] = useState<any\[\]>\(\[\]\);/, 'const [invoices, setInvoices] = useState<any[]>([]);');

fs.writeFileSync('src/components/DataMigrationModal.tsx', code);
console.log('Fixed');
