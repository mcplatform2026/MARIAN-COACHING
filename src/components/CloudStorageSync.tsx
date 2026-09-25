import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { doc, getDoc, setDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function CloudStorageSync({ children }: { children: React.ReactNode }) {
  const { user, dbUid } = useAuth();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!user || !dbUid) {
      setSynced(true);
      return;
    }
    setSynced(false);

    const docRef = doc(db, `users/${dbUid}/preferences/default`);

    // Perform initial upload if cloud is empty, otherwise populate localStorage
    async function initialSync() {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const cloudData = snap.data();
          for (const key in cloudData) {
            Storage.prototype.setItem.call(localStorage, key, cloudData[key]);
          }
        } else {
          const localData: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('firebase:')) {
              localData[key] = localStorage.getItem(key) || '';
            }
          }
          await setDoc(docRef, localData, { merge: true });
        }
      } catch (err) {
        console.error("Cloud initial sync failed:", err);
      } finally {
        setSynced(true);
      }
    }

    initialSync();
  }, [user, dbUid]);

  // Listen to remote changes
  useEffect(() => {
    if (!user || !dbUid || !synced) return;
    
    const docRef = doc(db, `users/${dbUid}/preferences/default`);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const cloudData = snap.data();
        let changed = false;
        for (const key in cloudData) {
          if (cloudData[key] !== undefined && localStorage.getItem(key) !== cloudData[key]) {
            Storage.prototype.setItem.call(localStorage, key, cloudData[key]);
            changed = true;
            
            // Dispatch events for specific keys to trigger instant UI updates if needed
            if (key === 'pastInvoices') {
               window.dispatchEvent(new Event('pastInvoicesChanged'));
            }
            if (key === 'brandName') {
               window.dispatchEvent(new Event('brandNameChange'));
            }
            if (key === 'brandColor') {
               window.dispatchEvent(new Event('brandColorChange'));
            }
            if (key === 'agreementLogo') {
               window.dispatchEvent(new Event('agreementLogoChange'));
            }
          }
        }
        
        if (changed) {
          // Trigger a generic event just in case
          window.dispatchEvent(new Event('cloudSyncUpdated'));
        }
      }
    });

    return () => unsubscribe();
  }, [user, dbUid, synced]);

  // Intercept localStorage mutations to sync up to Firebase
  useEffect(() => {
    if (!user || !dbUid || !synced) return;

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (typeof key === 'string' && !key.startsWith('firebase:')) {
        setDoc(doc(db, `users/${dbUid}/preferences/default`), { [key]: value }, { merge: true })
          .catch(err => console.error("Cloud setItem sync failed", err));
      }
    };

    localStorage.removeItem = function(key) {
      originalRemoveItem.apply(this, arguments);
      if (typeof key === 'string' && !key.startsWith('firebase:')) {
        setDoc(doc(db, `users/${dbUid}/preferences/default`), { [key]: deleteField() }, { merge: true })
          .catch(err => console.error("Cloud removeItem sync failed", err));
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, [user, dbUid, synced]);

  if (!synced) {
    return <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">Syncing Data...</div>;
  }

  return <>{children}</>;
}
