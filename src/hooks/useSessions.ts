import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  rate?: number;
  source?: string;
  createdAt: any;
}

export const useSessions = () => {
  const { user, dbUid } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/sessions`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Session[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading sessions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addSession = async (data: Omit<Session, 'id' | 'createdAt'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await addDoc(collection(db, `users/${dbUid}/sessions`), {
      ...data,
      createdAt: serverTimestamp()
    });
  };
  
  const updateSession = async (id: string, data: Partial<Omit<Session, 'id' | 'createdAt'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await updateDoc(doc(db, `users/${dbUid}/sessions/${id}`), {
      ...data
    });
  };
  
  const removeSession = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await deleteDoc(doc(db, `users/${dbUid}/sessions/${id}`));
  };

  return { sessions, loading, addSession, updateSession, removeSession };
};
