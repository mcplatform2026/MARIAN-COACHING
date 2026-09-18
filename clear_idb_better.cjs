const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

if (!code.includes('clearIndexedDbPersistence')) {
  code = code.replace(
    'export const db = getFirestore(app);',
    `export const db = getFirestore(app);
import { terminate, clearIndexedDbPersistence } from "firebase/firestore";
// Temporary block to clear infinite loop queue
terminate(db).then(() => clearIndexedDbPersistence(db)).catch(() => {});
`
  );
  fs.writeFileSync('src/lib/firebase.ts', code);
  console.log("Injected better clearIndexedDbPersistence");
}
