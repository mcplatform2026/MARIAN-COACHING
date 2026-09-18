const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

const oldFetch = `const docRef = doc(db, "users/" + uid + "/agreements/inv_" + id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {`;

const newFetch = `// Try short-link first
        let docId = id;
        if (!id.startsWith('inv_')) {
          docId = 'inv_' + id;
        }
        
        let docRef = doc(db, "users/" + uid + "/agreements/" + docId);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          // Fallback to legacy invoices collection
          docRef = doc(db, "users/" + uid + "/invoices/" + id);
          try {
            docSnap = await getDoc(docRef);
          } catch (e) {
            console.error("Fallback legacy fetch failed:", e);
          }
        }
        
        if (docSnap.exists()) {`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Patched InvoiceView fallback');
