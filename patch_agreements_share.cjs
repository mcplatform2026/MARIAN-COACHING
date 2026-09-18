const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

const newFunc = `  const handleShareHostedLink = async (agreement: Agreement, method: 'email' | 'whatsapp' | 'copy') => {
    let shortId = agreement.shortShareId;
    if (!shortId) {
      shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      // We don't necessarily need to save shortId back to agreements here, 
      // but if we do, we need an updateDoc. We can just use the agreement.id as part of it or just generate a new one each time.
      // Actually, let's just generate a new one if not present, and save it to the DB if we are owner.
      if (user?.uid) {
        try {
          const { updateDoc, doc } = require('firebase/firestore');
          await updateDoc(doc(db, \`users/\${user.uid}/agreements/\${agreement.id}\`), {
            shortShareId: shortId
          });
          agreement.shortShareId = shortId;
        } catch(e) {}
      }
    }

    if (user?.uid) {
      try {
        const { setDoc, doc } = require('firebase/firestore');
        await setDoc(doc(db, \`shared_links/\${shortId}\`), {
          type: 'agreement',
          data: agreement,
          ownerUid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = \`\${window.location.origin}/a/\${shortId}\`;

    if (method === 'whatsapp') {
      const text = \`Here is the link to the agreement: \${hostedLink}\`;
      window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
    } else if (method === 'email') {
      window.open(getEmailLink(agreement.title || "Agreement", \`Here is the link to the agreement: \${hostedLink}\`));
    } else if (method === 'copy') {
      navigator.clipboard.writeText(hostedLink);
      alert('Shareable short link copied to clipboard!');
    }
  };

  const handleCopyLink = (id: string, customDbUid?: string) => {`;

code = code.replace("  const handleCopyLink = (id: string, customDbUid?: string) => {", newFunc);

// Now replace the <a> tags with <button>
const oldWhatsapp = `<a 
                            href={\`https://wa.me/?text=\${encodeURIComponent(\`Here is the link to the agreement: \${window.location.origin}/agreement/\${user?.uid}/\${agreement.id}\`)}\`}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>`;

const newWhatsapp = `<button 
                            onClick={(e) => { e.preventDefault(); handleShareHostedLink(agreement, 'whatsapp'); }}
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold flex items-center justify-center"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>`;

const oldEmail = `<a 
                            href={getEmailLink(agreement.title || "Agreement", \`Here is the link to the agreement: \${window.location.origin}/agreement/\${user?.uid}/\${agreement.id}\`)}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Send via Email"
                          >
                            <Mail size={14} />
                          </a>`;

const newEmail = `<button 
                            onClick={(e) => { e.preventDefault(); handleShareHostedLink(agreement, 'email'); }}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="Send via Email"
                          >
                            <Mail size={14} />
                          </button>`;

code = code.replace(oldWhatsapp, newWhatsapp);
code = code.replace(oldEmail, newEmail);

// Also replace copy link button
const oldCopy = `onClick={() => handleCopyLink(agreement.id, user?.uid)}`;
const newCopy = `onClick={() => handleShareHostedLink(agreement, 'copy')}`;
code = code.replace(oldCopy, newCopy);

fs.writeFileSync('src/pages/Agreements.tsx', code);
console.log('Patched Agreements.tsx');
