const fs = require('fs');

// Patch Invoices.tsx
let invCode = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');
invCode = invCode.replace(
  'if (file.size > 500 * 1024) { alert("Logo is too large. Please upload an image smaller than 500KB to ensure smooth saving."); return; }',
  'if (file.size > 250 * 1024) { alert("Logo is too large. Please upload an image smaller than 250KB to ensure smooth saving."); return; }'
);
invCode = invCode.replace(
  'if (file.size > 500 * 1024) { alert("Signature is too large. Please upload an image smaller than 500KB."); return; }',
  'if (file.size > 250 * 1024) { alert("Signature is too large. Please upload an image smaller than 250KB."); return; }'
);
fs.writeFileSync('src/pages/Invoices.tsx', invCode);
console.log('Patched Invoices.tsx');

// Patch AgreementStudio.tsx
let agrCode = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');
agrCode = agrCode.replace(
  'if (file.size > 500 * 1024) { alert("Logo is too large. Please upload an image smaller than 500KB to ensure smooth saving."); return; }',
  'if (file.size > 250 * 1024) { alert("Logo is too large. Please upload an image smaller than 250KB to ensure smooth saving."); return; }'
);
fs.writeFileSync('src/components/AgreementStudio.tsx', agrCode);
console.log('Patched AgreementStudio.tsx');
