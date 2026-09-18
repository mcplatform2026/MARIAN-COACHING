const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const targetStr = `          if (data.status === "sent") {
            try {
              await updateDoc(docRef, {
                status: "accepted",
                clientSignature: clientSig,
                acceptedAt: new Date().toISOString(),
              });
            } catch (dbErr) {
              console.warn(
                "Database update failed, but proceeding locally:",
                dbErr,
              );
            } // ignore errors here
          }`;

const replacementStr = `          if (data.status === "sent") {
            try {
              await updateDoc(docRef, {
                status: "viewed",
                viewedAt: new Date().toISOString(),
              });
            } catch (dbErr) {
              console.warn("Database update failed:", dbErr);
            } 
          }`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
