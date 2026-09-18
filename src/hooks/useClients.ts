import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Client {
  id: string;
  name?: string;
  timestamp: any;
  [key: string]: any;
}

export const useClients = () => {
  const { user, dbUid } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/clients`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Client[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addClient = async (data: Omit<Client, 'id' | 'timestamp'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await addDoc(collection(db, `users/${dbUid}/clients`), {
      ...data,
      timestamp: serverTimestamp()
    });
  };
  
  const updateClient = async (id: string, data: Partial<Omit<Client, 'id' | 'timestamp'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await updateDoc(doc(db, `users/${dbUid}/clients/${id}`), {
      ...data
    });
  };
  
  const removeClient = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await deleteDoc(doc(db, `users/${dbUid}/clients/${id}`));
  };

  return { clients, loading, addClient, updateClient, removeClient };
};
