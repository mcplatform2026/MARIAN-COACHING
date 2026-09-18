const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

const target = `      try {
        // Try short-link first
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
        
        if (docSnap.exists()) {
          setInvoice(docSnap.data());
        } else {
          setNotFound(true);
        }`;

const replacement = `      try {
        if (!uid && id) {
          // Very short link /i/:id
          const docRef = doc(db, "shared_links", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            if (docData.type === 'invoice' && docData.data) {
              setInvoice(docData.data);
            } else {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        } else {
          // Legacy links
          let docId = id;
          if (!id.startsWith('inv_')) {
            docId = 'inv_' + id;
          }
          
          let docRef = doc(db, "users/" + uid + "/agreements/" + docId);
          let docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            docRef = doc(db, "users/" + uid + "/invoices/" + id);
            try { docSnap = await getDoc(docRef); } catch (e) {}
          }
          
          if (docSnap.exists()) {
            setInvoice(docSnap.data());
          } else {
            setNotFound(true);
          }
        }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Patched InvoiceView.tsx');
