const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const shareCode = `  const handleShareHostedLink = async (invoice: SavedInvoice, method: 'email' | 'whatsapp') => {
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
        await setDoc(doc(db, \`shared_links/\${shortId}\`), {
          type: 'invoice',
          data: invoice,
          ownerUid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = \`\${window.location.origin}/i/\${shortId}\`;

    if (method === 'whatsapp') {
      const text = \`Hi, you can securely view and download your invoice here: \${hostedLink}\`;
      window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
    } else {
      window.open(\`mailto:?subject=Invoice from \${brandName}&body=Hi, you can securely view and download your invoice here: \${hostedLink}\`);
    }
  };`;

// replace the entire function
const startIdx = code.indexOf('const handleShareHostedLink =');
const endIdx = code.indexOf('};', startIdx) + 2;
if (startIdx > -1) {
  code = code.substring(0, startIdx) + shareCode + code.substring(endIdx);
  fs.writeFileSync('src/pages/Invoices.tsx', code);
  console.log('Patched Invoices.tsx');
}
