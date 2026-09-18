const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('clearIndexedDbPersistence')) {
  code = `
import { clearIndexedDbPersistence } from 'firebase/firestore';
import { db } from './lib/firebase';
clearIndexedDbPersistence(db).catch(() => {});
` + code;
  fs.writeFileSync('src/main.tsx', code);
  console.log("Injected clearIndexedDbPersistence");
}
