const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

code = code.replace(
  "import { db } from '../lib/firebase';",
  "import { db } from '../lib/firebase';\nimport { doc, setDoc, updateDoc } from 'firebase/firestore';"
);

fs.writeFileSync('src/pages/Agreements.tsx', code);
