const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// 1. Rewrite handleDuplicateInvoice
const newHandleDuplicate = `  const handleDuplicateInvoice = async (invoice: SavedInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newId = \`inv_\${Date.now()}\`;
    const duplicatedInvoice: SavedInvoice = {
      ...invoice,
      id: newId,
      invoiceNo: \`\${invoice.invoiceNo}-DUP\`,
      createdAt: new Date().toISOString()
    };
    
    // Remove shortShareId so it generates a new link when shared
    delete duplicatedInvoice.shortShareId;

    const existingStored = localStorage.getItem('pastInvoices');
    let parsed: SavedInvoice[] = [];
    if (existingStored) {
      try {
        parsed = JSON.parse(existingStored) as SavedInvoice[];
      } catch(e) {}
    }
    
    parsed.unshift(duplicatedInvoice);
    localStorage.setItem('pastInvoices', JSON.stringify(parsed));
    setSavedInvoices(parsed);
    
    // Also save to firebase if user logged in
    const authUser = auth.currentUser;
    if (authUser?.uid) {
      try {
        const { setDoc, doc } = require('firebase/firestore');
        await setDoc(doc(db, \`users/\${authUser.uid}/invoices/\${newId}\`), duplicatedInvoice);
      } catch (err) {
        console.error("Cloud sync failed for duplicate:", err);
      }
    }
  };`;

code = code.replace(
  /  const handleDuplicateInvoice = \(invoice: SavedInvoice, e: React\.MouseEvent\) => \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\);\n  \};/,
  newHandleDuplicate
);

// 2. Remove Whatsapp and Email icons from the past invoices cards
code = code.replace(
  `                          <button
                            onClick={() => handleShareHostedLink(inv, 'whatsapp')}
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold flex items-center justify-center"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleShareHostedLink(inv, 'email')}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="Send via Email"
                          >
                            <Mail size={14} />
                          </button>`,
  ``
);

fs.writeFileSync('src/pages/Invoices.tsx', code);
