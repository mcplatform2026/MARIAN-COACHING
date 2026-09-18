import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

# Make sure onAuthStateChanged and auth are imported
if "import { auth } from" not in content:
    content = content.replace("import { db } from '../lib/firebase';", "import { db, auth } from '../lib/firebase';\nimport { onAuthStateChanged } from 'firebase/auth';")

# Update useEffect
new_use_effect = """  useEffect(() => {
    const fetchAgreement = async () => {
      if (!uid || !id) return;
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
            });
          }
          if (data.status === 'accepted') {
            setAccepted(true);
          }
        } else {
          setError('Agreement not found');
        }
      } catch (err) {
        console.error(err);
        setError('You do not have permission to view this agreement. Ensure you are signed in or rules are updated.');
      } finally {
        setLoading(false);
      }
    };
    
    // Wait for auth state to initialize before fetching
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchAgreement();
    });
    
    return () => unsubscribe();
  }, [uid, id]);"""

content = re.sub(r"  useEffect\(\(\) => \{.*?fetchAgreement\(\);\n  \}, \[uid, id\]\);", new_use_effect, content, flags=re.DOTALL)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
