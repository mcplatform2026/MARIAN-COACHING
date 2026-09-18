const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

code = code.replace(
  `const { setDoc, doc } = require('firebase/firestore');
        await setDoc(doc(db, \`users/\${authUser.uid}/invoices/\${newId}\`), duplicatedInvoice);`,
  `await setDoc(doc(db, \`users/\${authUser.uid}/invoices/\${newId}\`), duplicatedInvoice);`
);

code = code.replace(
  `import { db } from "../lib/firebase";`,
  `import { db, auth } from "../lib/firebase";`
);

fs.writeFileSync('src/pages/Invoices.tsx', code);
