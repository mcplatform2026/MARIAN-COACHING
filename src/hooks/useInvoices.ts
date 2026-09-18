import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Invoice {
  id: string;
  invoiceId: string;
  clientName: string;
  clientEmail?: string;
  date: string;
  status: 'paid' | 'unpaid';
  total: number;
  timestamp: any;
  items?: any[];
  [key: string]: any;
}

export const useInvoices = () => {
  const { user, dbUid } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/invoices`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Invoice[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Invoice);
      });
      setInvoices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addInvoice = async (data: Omit<Invoice, 'id' | 'timestamp'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    return await addDoc(collection(db, `users/${dbUid}/invoices`), {
      ...data,
      timestamp: serverTimestamp()
    });
  };

  const updateInvoice = async (id: string, data: Partial<Omit<Invoice, 'id' | 'timestamp'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await updateDoc(doc(db, `users/${dbUid}/invoices/${id}`), {
      ...data
    });
  };

  const removeInvoice = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, `users/${dbUid}/invoices/${id}`));
  };

  return { invoices, loading, addInvoice, updateInvoice, removeInvoice };
};
