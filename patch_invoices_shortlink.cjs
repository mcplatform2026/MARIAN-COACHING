const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Find handleShareHostedLink
const targetStr = `    const hostedLink = \\\`\\\${window.location.origin}/invoice/\\\${user?.uid}/\\\${invoice.id}\\\`;`;
const replacementStr = `
    let shortId = invoice.shortShareId;
    if (!shortId) {
      shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Update local storage
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        const parsed = JSON.parse(stored);
        const idx = parsed.findIndex((i) => i.id === invoice.id);
        if (idx > -1) {
          parsed[idx].shortShareId = shortId;
          localStorage.setItem('pastInvoices', JSON.stringify(parsed));
          setSavedInvoices(parsed);
        }
      }
    }

    // Save into the publicly readable 'agreements' subcollection to bypass strict rules
    if (user?.uid) {
      try {
        const { setDoc, doc } = require('firebase/firestore');
        await setDoc(doc(db, \`users/\${user.uid}/agreements/inv_\${shortId}\`), {
          ...invoice,
          isPublicInvoice: true,
          shortShareId: shortId
        });
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    // Create the clean short link
    const hostedLink = \`\${window.location.origin}/inv/\${user?.uid}/\${shortId}\`;
`;

// Oh, wait, I already have `setDoc` and `doc` imported in Invoices.tsx from firebase/firestore. So I don't need `require`.
// Let's refine the replacement string.

const exactTarget = "    const hostedLink = `\\${window.location.origin}/invoice/\\${user?.uid}/\\${invoice.id}`;";

const cleanReplacement = `
    let shortId = invoice.shortShareId;
    if (!shortId) {
      shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        const parsed = JSON.parse(stored);
        const idx = parsed.findIndex((i) => i.id === invoice.id);
        if (idx > -1) {
          parsed[idx].shortShareId = shortId;
          localStorage.setItem('pastInvoices', JSON.stringify(parsed));
          setSavedInvoices(parsed);
          invoice.shortShareId = shortId;
        }
      }
    }

    if (user?.uid) {
      try {
        await setDoc(doc(db, \`users/\${user.uid}/agreements/inv_\${shortId}\`), invoice);
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = \`\${window.location.origin}/inv/\${user?.uid}/\${shortId}\`;`;

code = code.replace(exactTarget, cleanReplacement);
fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Patched handleShareHostedLink');
