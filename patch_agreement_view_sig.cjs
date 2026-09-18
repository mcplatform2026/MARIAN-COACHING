const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// The short link fetch looks like this:
/*
          if (docSnap.exists()) {
             const docData = docSnap.data();
             if (docData.type === 'agreement' && docData.data) {
                const data = docData.data;
                setAgreement({ id: data.id, ...data });
                if (data.status === "accepted") setAccepted(true);
                setLoading(false);
                
                return;
             }
*/

// Instead of returning, we should set `docRef` to point to the original document, so that when they click "Sign", it updates the original document!
// And we should ignore the permission error when updating if it fails, or tell the user to update rules for the original document.

const target = `                setLoading(false);
                
                // Do not attempt to update status to viewed since we are on a short link
                // The viewer is anonymous and cannot update the original document anyway
                return;
             } else {`;

const replacement = `                setLoading(false);
                
                // Override docRef to point to the original document so signing works!
                docRef = doc(db, \`users/\${docData.ownerUid}/agreements/\${data.id}\`);
                return;
             } else {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/AgreementView.tsx', code);
console.log('Patched AgreementView signature docRef');
