import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

# Replace fetchAgreement to check for hash first!
fetch_pattern = r'const fetchAgreement = async \(\) => \{.*?if \(\!uid \|\| \!id\) return;\n(.*?)\} catch \(err\) \{'

new_fetch = """const fetchAgreement = async () => {
      if (!uid || !id) return;
      
      // 1. Try to load from URL Hash first (Serverless Fallback)
      const hash = window.location.hash;
      if (hash && hash.startsWith('#data=')) {
        try {
          const encoded = hash.replace('#data=', '');
          import('lz-string').then(LZString => {
             const decoded = LZString.default.decompressFromEncodedURIComponent(encoded);
             if (decoded) {
               const data = JSON.parse(decoded);
               setAgreement(data);
               if (data.status === 'accepted') setAccepted(true);
               setLoading(false);
             }
          });
          
          // Optionally still try to update DB status to viewed in background
          try {
            const docRef = doc(db, `users/${uid}/agreements/${id}`);
            updateDoc(docRef, { status: 'viewed', viewedAt: new Date().toISOString() }).catch(() => {});
          } catch(e) {}
          
          return; // Skip DB fetch if hash succeeds
        } catch(e) {
          console.error("Failed to parse hash", e);
        }
      }
      
      try {
        const docRef = doc(db, `users/${uid}/agreements/${id}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAgreement({ id: docSnap.id, ...data });
          
          if (data.status === 'sent') {
            await updateDoc(docRef, { 
              status: 'viewed',
              viewedAt: new Date().toISOString()
            }).catch(() => {}); // ignore errors here
          }
          if (data.status === 'accepted') {
            setAccepted(true);
            localStorage.setItem(`agreement_${id}_status`, 'Signed');
          }
        } else {
          setError('Agreement not found');
        }
      } catch (err) {"""
      
content = re.sub(r'const fetchAgreement = async \(\) => \{[\s\S]*?\} catch \(err\) \{', new_fetch, content)

# Also fix handleSign to not crash if DB update fails
handle_sign = r'await updateDoc\(docRef, \{[\s\S]*?\}\);'
new_handle_sign = """try {
        await updateDoc(docRef, { 
          status: 'accepted',
          clientSignature: clientSig,
          acceptedAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Database update failed, but proceeding locally:", dbErr);
      }"""
content = re.sub(handle_sign, new_handle_sign, content)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)

