const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const target = `      try {
        const docRef = doc(db, \`users/\${uid}/agreements/\${id}\`);
        const docSnap = await getDoc(docRef);`;

const replacement = `      try {
        let docSnap;
        let docRef;
        
        if (!uid && id) {
          // Short link
          docRef = doc(db, \`shared_links/\${id}\`);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
             const docData = docSnap.data();
             if (docData.type === 'agreement' && docData.data) {
                const data = docData.data;
                setAgreement({ id: data.id, ...data });
                if (data.status === "accepted") setAccepted(true);
                setLoading(false);
                
                // Do not attempt to update status to viewed since we are on a short link
                // The viewer is anonymous and cannot update the original document anyway
                return;
             } else {
                setError("Agreement not found");
                setLoading(false);
                return;
             }
          }
        }
        
        // Legacy link
        docRef = doc(db, \`users/\${uid}/agreements/\${id}\`);
        docSnap = await getDoc(docRef);`;

code = code.replace(target, replacement);

// Fix the catch block as well to not show the red permission error for short links if we can avoid it.
// Actually, if short link exists, it returns early. If it doesn't, it falls through to legacy which throws.
// If it throws, it shows the red permission error. That's fine for invalid links.

fs.writeFileSync('src/pages/AgreementView.tsx', code);
console.log('Patched AgreementView.tsx');
