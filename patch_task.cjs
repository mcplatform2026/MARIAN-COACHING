const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useTasks, Task } from "../hooks/useTasks";
import { Trash2, Plus, Calendar, Pencil, X, Check } from "lucide-react";

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

export function TaskTracker() {
  const { tasks, loading, addTask, updateTask, removeTask } = useTasks();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed' | 'upcoming'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || '#6933ff');

  useEffect(() => {
    const handleStorageChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
      setBrandColor(localStorage.getItem('brandColor') || '#6933ff');
    };
    window.addEventListener('brandNameChange', handleStorageChange);
    window.addEventListener('brandColorChange', handleStorageChange);
    return () => {
      window.removeEventListener('brandNameChange', handleStorageChange);
      window.removeEventListener('brandColorChange', handleStorageChange);
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    setIsAdding(true);
    try {
      await addTask({
        title: newTaskTitle.trim(),
        status: 'todo',
        dueDate: newTaskDate || undefined
      });
      setNewTaskTitle('');
      setNewTaskDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateTask(taskId, {
        title: editTitle.trim(),
        dueDate: editDate || undefined
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEditingTaskId(null);
    }
  };

  const isUpcoming = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return dueDate >= today;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(task.dueDate) && task.status !== 'completed';
    return task.status === filter;
  });

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  }

  const statusColors: Record<string, string> = {
    'todo': 'bg-neutral-100 text-neutral-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    'completed': 'bg-emerald-100 text-emerald-800'
  };

  return (
    <main className="flex-1 p-6 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span style={{ color: brandColor }}>{brandName}'S</span> TASK TRACKER
          </h2>
        </div>
      </div>

      <div className="border-2 border-black bg-surface-container-lowest neu-shadow mb-8 md:mb-12 w-full flex flex-col mt-4">
        <div className="bg-secondary-container border-b-2 border-black p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <form onSubmit={handleAddTask} className="relative flex-1 w-full flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 w-full min-w-0 px-4 py-2 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"
              required
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-40 px-3 py-2 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container uppercase font-bold"
                title="Due Date"
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-6 py-2 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"
                style={{ backgroundColor: brandColor }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {isAdding ? 'ADDING' : 'ADD'}
              </button>
            </div>
          </form>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
            {['all', 'todo', 'in-progress', 'completed', 'upcoming'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={\`px-3 py-1.5 text-[10px] font-headline font-bold uppercase whitespace-nowrap transition-colors border-2 border-black \${
                  filter === f ? 'bg-primary-container text-white' : 'bg-surface-container-lowest text-black hover:bg-surface-container-high'
                }\`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full bg-white select-none">
          <table className="w-full text-left font-body text-xs border-collapse min-w-[700px]">
            <thead className="bg-neutral-100 font-headline uppercase text-[9px] md:text-[11px] tracking-wider">
              <tr className="border-b-2 border-black">
                <th className="px-4 py-3 font-bold border-r border-black w-40">Status</th>
                <th className="px-4 py-3 font-bold border-r border-black">Task Title</th>
                <th className="px-4 py-3 font-bold border-r border-black w-48">Due Date</th>
                <th className="px-4 py-3 font-bold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-neutral-400 font-headline font-bold text-xs uppercase tracking-wide">
                    No tasks found for this view.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className={\`border-b-2 border-black transition-colors \${task.status === 'completed' ? 'bg-neutral-50/50' : 'hover:bg-neutral-50'}\`}>
                    <td className="px-4 py-3 border-r border-black">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        className={\`px-2 py-1 text-[9px] font-headline font-bold uppercase tracking-wider border-2 border-black cursor-pointer outline-none focus:ring-2 focus:ring-black/5 \${statusColors[task.status] || ''}\`}
                      >
                        <option value="todo">TO-DO</option>
                        <option value="in-progress">IN PROGRESS</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 border-r border-black">
                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container"
                          autoFocus
                        />
                      ) : (
                        <span className={\`font-medium \${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-black'}\`}>
                          {task.title}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-black">
                      {editingTaskId === task.id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-black bg-white font-body text-[10px] outline-none focus:border-primary-container uppercase font-bold"
                        />
                      ) : (
                        task.dueDate ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-black uppercase tracking-wide">
                            <Calendar size={14} className="text-neutral-500" />
                            {formatDate(task.dueDate)}
                          </div>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {editingTaskId === task.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1 border border-black bg-white hover:bg-emerald-50 text-emerald-600 transition-all hover:scale-105 active:scale-95 shrink-0"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="p-1 border border-black bg-white hover:bg-neutral-100 text-black transition-all hover:scale-105 active:scale-95 shrink-0"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setEditTitle(task.title);
                                setEditDate(task.dueDate || '');
                              }}
                              className="p-1 border border-black bg-white hover:bg-neutral-100 text-black transition-all hover:scale-105 active:scale-95 shrink-0"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeTask(task.id)}
                              className="p-1 border border-black bg-white hover:bg-red-50 text-red-600 transition-all hover:scale-105 active:scale-95 shrink-0"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
`;

fs.writeFileSync('src/pages/TaskTracker.tsx', content);
