import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';

export function usePreferences() {
  const { user, dbUid } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) {
      setPreferences({});
      setLoading(false);
      return;
    }

    const docRef = doc(db, `users/${dbUid}/preferences/default`);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPreferences(docSnap.data());
      } else {
        setPreferences({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const updatePreferences = async (newPrefs: Record<string, any>) => {
    if (!user || !dbUid) return;
    const docRef = doc(db, `users/${dbUid}/preferences/default`);
    await setDoc(docRef, newPrefs, { merge: true });
  };

  return { preferences, loading, updatePreferences };
}
