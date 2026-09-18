const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(
  'const docRef = doc(db, `users/${finalUid}/agreements/${finalId}`);',
  'const docRef = doc(db, `users/${resolvedUid || uid}/agreements/${resolvedId || id}`);'
);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
