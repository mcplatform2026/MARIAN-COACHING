import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'ideas' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  timestamp: any;
  [key: string]: any;
}

export const useTasks = () => {
  const { user, dbUid } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUid) return;

    const q = query(
      collection(db, `users/${dbUid}/tasks`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Task[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dbUid]);

  const addTask = async (data: Omit<Task, 'id' | 'timestamp'>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    return await addDoc(collection(db, `users/${dbUid}/tasks`), {
      ...data,
      timestamp: serverTimestamp()
    });
  };

  const updateTask = async (id: string, data: Partial<Omit<Task, 'id' | 'timestamp'>>) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await updateDoc(doc(db, `users/${dbUid}/tasks/${id}`), {
      ...data
    });
  };

  const removeTask = async (id: string) => {
    if (!user || !dbUid) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, `users/${dbUid}/tasks/${id}`));
  };

  return { tasks, loading, addTask, updateTask, removeTask };
};
