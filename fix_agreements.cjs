const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

code = code.replace(
  `        const { setDoc, doc } = require('firebase/firestore');`,
  ``
);
code = code.replace(
  `        const { updateDoc, doc } = require('firebase/firestore');`,
  ``
);

fs.writeFileSync('src/pages/Agreements.tsx', code);
