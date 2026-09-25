import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Agreement {
  id: string;
  title?: string;
  templateType?: string;
  clientName: string;
  clientEmail: string;
  fee?: string;
  projectDetails: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted';
  sentAt?: any;
  viewedAt?: any;
  acceptedAt?: any;
  timestamp: any;
  [key: string]: any;
}

export const useAgreements = () => {
  const { user, dbUid } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/agreements`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Agreement[] = [];
      snapshot.forEach((doc) => {
        if (!doc.id.startsWith('inv_')) {
          data.push({ id: doc.id, ...doc.data() } as Agreement);
        }
      });
      setAgreements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addAgreement = async (data: Omit<Agreement, 'id' | 'timestamp'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    return await addDoc(collection(db, `users/${dbUid}/agreements`), {
      ...data,
      timestamp: serverTimestamp()
    });
  };

  const updateAgreement = async (id: string, data: Partial<Omit<Agreement, 'id' | 'timestamp'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await updateDoc(doc(db, `users/${dbUid}/agreements/${id}`), {
      ...data
    });
  };

  const removeAgreement = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, `users/${dbUid}/agreements/${id}`));
  };

  return { agreements, loading, addAgreement, updateAgreement, removeAgreement };
};
