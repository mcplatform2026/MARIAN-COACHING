import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  dbUid: string | null;
  isCollaborator: boolean;
  ownerEmail: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  dbUid: null, 
  isCollaborator: false, 
  ownerEmail: null 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [dbUid, setDbUid] = useState<string | null>(() => auth.currentUser?.uid || null);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const isAgreementRoute = window.location.pathname.startsWith('/agreement/') || window.location.pathname.startsWith('/document') || window.location.pathname.startsWith('/inv') || window.location.pathname.startsWith('/invoice') || window.location.pathname.startsWith('/i/') || window.location.pathname.startsWith('/a/');
  const [loading, setLoading] = useState(!isAgreementRoute && !auth.currentUser);

  useEffect(() => {
    let isMounted = true;
    
    // Safety fallback timeout: give Firebase sufficient time (10s) to restore local credentials
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth initialization timed out. Finalizing auth check.");
        setLoading(false);
      }
    }, 10000);

    // If available, await authStateReady() to confirm IndexedDB has finished evaluating stored tokens
    if (typeof auth.authStateReady === 'function') {
      auth.authStateReady().then(() => {
        // Auth state ready
      }).catch((err) => {
        console.warn("authStateReady caught error:", err);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(timeoutId);
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        try {
          localStorage.setItem('marian_coaching_auth_active', 'true');
        } catch {}
        try {
          const email = currentUser.email?.toLowerCase().trim();
          if (email) {
            const docRef = doc(db, 'collaborators', email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setDbUid(data.ownerUid || currentUser.uid);
              setIsCollaborator(true);
              setOwnerEmail(data.ownerEmail || null);
            } else {
              setDbUid(currentUser.uid);
              setIsCollaborator(false);
              setOwnerEmail(null);
            }
          } else {
            setDbUid(currentUser.uid);
            setIsCollaborator(false);
            setOwnerEmail(null);
          }
        } catch (error) {
          console.error("Error fetching collaborator details:", error);
          setDbUid(currentUser.uid);
          setIsCollaborator(false);
          setOwnerEmail(null);
        }
      } else {
        try {
          localStorage.removeItem('marian_coaching_auth_active');
        } catch {}
        setDbUid(null);
        setIsCollaborator(false);
        setOwnerEmail(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, dbUid, isCollaborator, ownerEmail }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
