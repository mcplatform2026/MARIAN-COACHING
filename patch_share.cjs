const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Insert handleShareHostedLink right after handleDownloadSaved
const handleShareHostedLinkCode = `
  const handleShareHostedLink = async (invoice: SavedInvoice, method: 'email' | 'whatsapp') => {
    // Ensure the invoice exists in the cloud before linking
    if (user?.uid) {
      try {
        await setDoc(doc(db, \`users/\${user.uid}/invoices/\${invoice.id}\`), invoice);
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = \`\${window.location.origin}/invoice/\${user?.uid}/\${invoice.id}\`;
    
    if (method === 'whatsapp') {
      const text = \`Hi, you can securely view and download your invoice here: \${hostedLink}\`;
      window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
    } else {
      const subject = \`Invoice #\${invoice.invoiceNo}\`;
      const body = \`Hi, you can securely view and download your invoice here:\\n\\n\${hostedLink}\`;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(\`mailto:?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`, '_blank');
      } else {
        window.open(\`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`, '_blank');
      }
    }
  };
`;

code = code.replace('const handleDownloadSaved = (invoice: SavedInvoice) => {', handleShareHostedLinkCode + '\n  const handleDownloadSaved = (invoice: SavedInvoice) => {');

// Replace the anchor tags for WhatsApp and Email with buttons
const oldWhatsApp = /<a[^>]*title="Send via WhatsApp[^>]*>[\s\S]*?<\/a>/g;
const newWhatsApp = `<button
                            onClick={() => handleShareHostedLink(inv, 'whatsapp')}
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold flex items-center justify-center"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>`;

const oldEmail = /<a[^>]*title="Send via Email[^>]*>[\s\S]*?<\/a>/g;
const newEmail = `<button
                            onClick={() => handleShareHostedLink(inv, 'email')}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="Send via Email"
                          >
                            <Mail size={14} />
                          </button>`;

code = code.replace(oldWhatsApp, newWhatsApp);
code = code.replace(oldEmail, newEmail);

fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Patched share buttons');
