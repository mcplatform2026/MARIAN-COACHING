const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(
  'localStorage.setItem(`agreement_${finalId}_status`, "Signed");',
  'localStorage.setItem(`agreement_${id}_status`, "Signed");'
);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
