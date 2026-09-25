import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  date: string;
  description: string;
  timestamp: any;
}

export const useTransactions = () => {
  const { user, dbUid } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/transactions`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans: Transaction[] = [];
      snapshot.forEach((doc) => {
        trans.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(trans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await addDoc(collection(db, `users/${dbUid}/transactions`), {
      ...data,
      timestamp: serverTimestamp()
    });
  };
  
  const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'timestamp'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await updateDoc(doc(db, `users/${dbUid}/transactions/${id}`), data);
  };
  
  const removeTransaction = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    await deleteDoc(doc(db, `users/${dbUid}/transactions/${id}`));
  };

  return { transactions, loading, addTransaction, updateTransaction, removeTransaction };
};
