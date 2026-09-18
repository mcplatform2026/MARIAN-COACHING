import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Update handleCopyLink in Agreements.tsx
old_handle_copy = r"  const handleCopyLink = \(id: string, customDbUid\?: string\) => \{.*?\n  \};"

new_handle_copy = """  const handleCopyLink = (id: string, customDbUid?: string) => {
    const uidToUse = customDbUid || user?.uid;
    if (!uidToUse) return;
    
    // Find the agreement to encode
    const agreement = agreements.find(a => a.id === id);
    let link = `${window.location.origin}/agreement/${uidToUse}/${id}`;
    
    // Fulfill request: generate zero-cost shareable URL containing encoded document data
    if (agreement) {
      const encodedData = btoa(encodeURIComponent(JSON.stringify(agreement)));
      link += `#data=${encodedData}`;
    }
    
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };"""

content = re.sub(old_handle_copy, new_handle_copy, content, flags=re.DOTALL)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)

with open('src/pages/AgreementView.tsx', 'r') as f:
    content2 = f.read()

# Update fetchAgreement in AgreementView.tsx
old_fetch = r"    const fetchAgreement = async \(\) => \{.*?try \{.*?const docRef = doc\(db, `users/\$\{uid\}/agreements/\$\{id\}`\);"

new_fetch = """    const fetchAgreement = async () => {
      if (!uid || !id) return;
      
      // Check for zero-cost encoded data in URL hash
      if (window.location.hash.startsWith('#data=')) {
        try {
          const encoded = window.location.hash.substring(6);
          const decodedStr = decodeURIComponent(atob(encoded));
          const parsedData = JSON.parse(decodedStr);
          setAgreement({ id, ...parsedData });
          
          if (parsedData.status === 'accepted') {
            setAccepted(true);
          }
          setLoading(false);
          return; // Skip Firestore to ensure zero-cost performance
        } catch (e) {
          console.error("Failed to decode zero-cost URL data, falling back to Firestore", e);
        }
      }
      
      try {
        const docRef = doc(db, `users/${uid}/agreements/${id}`);"""

content2 = re.sub(old_fetch, new_fetch, content2, flags=re.DOTALL)

# Let's also update handleAgree to NOT call Firestore if it's an encoded URL?
# Wait, if they sign it, we SHOULD update Firestore so the admin sees it, right?
# But if it's zero-cost, maybe we don't. The prompt says: "updates the status to Signed in localStorage, and generates the PDF".
# Let's add a skip for Firestore if we loaded from encoded data.
# Actually, the user says "updates the status to Signed in localStorage, and generates the PDF".

old_handle_agree_try = r"    try \{\n      setLoading\(true\);\n      const docRef = doc\(db, `users/\$\{uid\}/agreements/\$\{id\}`\);\n      await updateDoc\(docRef, \{"

new_handle_agree_try = """    try {
      setLoading(true);
      
      // Update localStorage as requested
      localStorage.setItem(`agreement_${id}_status`, 'Signed');
      
      // Only update Firestore if we didn't load from a zero-cost URL
      if (!window.location.hash.startsWith('#data=')) {
        const docRef = doc(db, `users/${uid}/agreements/${id}`);
        await updateDoc(docRef, {"""

content2 = re.sub(old_handle_agree_try, new_handle_agree_try, content2, flags=re.DOTALL)

old_handle_agree_end = r"      \}\);\n      setAgreement\(\(prev: any\) => \(\{\n? \.\.\.prev,\n? signature: signatureImage\n? \}\)\);\n      setAccepted\(true\);\n      // Fulfill request to update status in localStorage\n      localStorage\.setItem\(`agreement_\$\{id\}_status`, 'Signed'\);\n    \} catch \(err\) \{"

new_handle_agree_end = """      });
      }
      
      setAgreement((prev: any) => ({ ...prev, signature: signatureImage }));
      setAccepted(true);
      
      // Auto-trigger PDF download as requested
      setTimeout(() => {
        handleDownloadPDF();
      }, 500);
      
    } catch (err) {"""

content2 = re.sub(old_handle_agree_end, new_handle_agree_end, content2, flags=re.DOTALL)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content2)

