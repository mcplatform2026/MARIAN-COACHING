const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(
  /const docRef = doc\(db, `users\/\$\{uid\}\/agreements\/\$\{id\}`\);/g,
  'const docRef = doc(db, `users/${finalUid}/agreements/${finalId}`);'
);
code = code.replace(
  /localStorage\.setItem\(`agreement_\$\{id\}_status`, "Signed"\);/g,
  'localStorage.setItem(`agreement_${finalId}_status`, "Signed");'
);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
