const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

const target = "const isAgreementRoute = window.location.pathname.startsWith('/agreement/') || window.location.pathname.startsWith('/document');";
const replacement = "const isAgreementRoute = window.location.pathname.startsWith('/agreement/') || window.location.pathname.startsWith('/document') || window.location.pathname.startsWith('/inv') || window.location.pathname.startsWith('/invoice');";

code = code.replace(target, replacement);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log('Patched AuthProvider.tsx');
