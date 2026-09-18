const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const targetStr = `      localStorage.setItem('pastInvoices', JSON.stringify(updatedInvoices));`;
const replacementStr = `      localStorage.setItem('pastInvoices', JSON.stringify(updatedInvoices));
      
      // Mirror to cloud for public links
      if (user?.uid) {
        try {
          await setDoc(doc(db, \`users/\${user.uid}/invoices/\${newId}\`), invoiceData);
        } catch (e) {
          console.error("Failed to sync invoice to cloud:", e);
        }
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Patched handleSaveInvoice');
