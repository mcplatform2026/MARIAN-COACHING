const fs = require('fs');
let inv = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Ensure signature Image scaling is functional
inv = inv.replace(/width:\s*`\$\{\(signatureImageScale \|\| 100\) \* 0\.8\}px`,/, 'width: `${(signatureImageScale || 100) * 0.8}px`,\n                              height: "auto",\n                              maxWidth: "100%",');

fs.writeFileSync('src/pages/Invoices.tsx', inv);
console.log("Done");
