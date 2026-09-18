const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  'setPersistence(auth, browserLocalPersistence).catch(console.error);',
  '// setPersistence(auth, browserLocalPersistence).catch(console.error);'
);

fs.writeFileSync('src/lib/firebase.ts', code);
