const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Add states
code = code.replace(
  'const [clientSig, setClientSig] = useState<string | null>(null);',
  'const [clientSig, setClientSig] = useState<string | null>(null);\n  const [resolvedUid, setResolvedUid] = useState<string | null>(uid || null);\n  const [resolvedId, setResolvedId] = useState<string | null>(id || null);'
);

// Update fetch
code = code.replace(
  `                if (data.status === "accepted") setAccepted(true);
                setLoading(false);
                
                // Override docRef to point to the original document so signing works!
                docRef = doc(db, \`users/\${docData.ownerUid}/agreements/\${data.id}\`);
                return;`,
  `                if (data.status === "accepted") setAccepted(true);
                setLoading(false);
                setResolvedUid(docData.ownerUid);
                setResolvedId(data.id);
                return;`
);

// Update handleAgree
code = code.replace(
  `  const handleAgree = async () => {
    if (!uid || !id) return;`,
  `  const handleAgree = async () => {
    const finalUid = resolvedUid || uid;
    const finalId = resolvedId || id;
    if (!finalUid || !finalId) return;`
);

// Replace instances of uid and id in handleAgree with finalUid and finalId
code = code.replace(
  `localStorage.setItem(\`agreement_\${id}_status\`, "Signed");
      const docRef = doc(db, \`users/\${uid}/agreements/\${id}\`);`,
  `localStorage.setItem(\`agreement_\${finalId}_status\`, "Signed");
      const docRef = doc(db, \`users/\${finalUid}/agreements/\${finalId}\`);`
);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
