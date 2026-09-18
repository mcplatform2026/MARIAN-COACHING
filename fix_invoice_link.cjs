const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

const oldTarget = `                             const invId = strVal.substring(12);
                             const inv = invoices.find((i) => i.id === invId);
                             const invName = inv?.invoiceId || 'App Invoice';
                             displayVal = (`;

const newTarget = `                             const invId = strVal.substring(12);
                             const inv = pastInvoices.find((i) => i.id === invId);
                             const invName = inv?.invoiceNo || 'App Invoice';
                             displayVal = (`;

if (code.includes(oldTarget)) {
    code = code.replace(oldTarget, newTarget);
    console.log("Replaced link renderer.");
} else {
    console.log("Could not find oldTarget.");
}

code = code.replace('const { invoices } = useInvoices();\n', '');
code = code.replace('import { useInvoices } from "../hooks/useInvoices";\n', '');

fs.writeFileSync('src/pages/Clients.tsx', code);
