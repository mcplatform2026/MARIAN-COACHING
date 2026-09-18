const fs = require('fs');

let mainCode = fs.readFileSync('src/main.tsx', 'utf8');
mainCode = mainCode.replace(/import \{ clearIndexedDbPersistence \}.*?clearIndexedDbPersistence\(db\)\.catch\(\(\) => \{\}\);/s, '');
mainCode = mainCode.replace(/\/\/ log_capture.*?firestore\.addDoc = function\(\.\.\.args\) \{.*?return originalAddDoc\.apply\(this, args\);\n\};/s, '');
fs.writeFileSync('src/main.tsx', mainCode);

let fbCode = fs.readFileSync('src/lib/firebase.ts', 'utf8');
fbCode = fbCode.replace(/import \{ terminate, clearIndexedDbPersistence \} from "firebase\/firestore";\n\/\/ Temporary block to clear infinite loop queue\nterminate\(db\)\.then\(\(\) => clearIndexedDbPersistence\(db\)\)\.catch\(\(\) => \{\}\);\n/s, '');
fs.writeFileSync('src/lib/firebase.ts', fbCode);

console.log("Reverted");
