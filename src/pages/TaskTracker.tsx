import React, { useState, useEffect } from "react";
import { useTasks, Task } from "../hooks/useTasks";
import { Trash2, Plus, Calendar, Pencil, X, Check } from "lucide-react";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";

const formatDate = (dateStr: string) => {
  return formatDateToMMDDYYYY(dateStr, '--');
};

export function TaskTracker() {
  const { tasks, loading, addTask, updateTask, removeTask } = useTasks();
  const [filter, setFilter] = useState<'today' | 'all' | 'todo' | 'in-progress' | 'ideas' | 'completed'>('today');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        priority: newTaskPriority,
        dueDate: newTaskDate || undefined
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskPriority('medium');
      setCurrentPage(1); // Go back to first page when adding a new task
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
        priority: editPriority,
        dueDate: editDate || undefined
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEditingTaskId(null);
    }
  };

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'today') return isToday(task.dueDate) && task.status !== 'completed';
    return task.status === filter;
  }).sort((a, b) => {
    // Keep recently added tasks (which already have higher timestamp) at the top,
    // but force completed tasks to the bottom.
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0; // The original hook sorts by timestamp desc, preserving new at top
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  }

  const statusColors: Record<string, string> = {
    'todo': 'bg-yellow-100 text-yellow-900',
    'in-progress': 'bg-blue-100 text-blue-800',
    'ideas': 'bg-purple-100 text-purple-800',
    'completed': 'bg-emerald-100 text-emerald-800'
  };
  
  const priorityColors: Record<string, string> = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-900',
    'low': 'bg-green-100 text-green-800'
  };

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span style={{ color: brandColor }}>{brandName}'S</span> TASK TRACKER
          </h2>
        </div>
      </div>

      <div className="border-2 border-black bg-surface-container-lowest neu-shadow mb-8 md:mb-12 w-full flex flex-col mt-4">
        <div className="bg-secondary-container border-b-2 border-black p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <form onSubmit={handleAddTask} className="relative flex-1 w-full flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="appearance-none rounded-none flex-1 w-full min-w-0 min-h-[52px] md:min-h-0 h-[52px] md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"
              required
            />
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="appearance-none w-full h-full pl-2 pr-7 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L5 6L10 0H0Z" fill="currentColor"/></svg>
                  </div>
                </div>
                <div className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container overflow-hidden">
                  <Calendar size={16} className="absolute left-2 text-black pointer-events-none z-10" />
                  {!newTaskDate && (
                    <span className="absolute left-[30px] text-xs font-bold font-body text-neutral-700 uppercase pointer-events-none z-0">
                      DD-MM-YYYY
                    </span>
                  )}
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className={`relative z-20 appearance-none w-full h-full pl-[30px] pr-0 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!newTaskDate ? 'text-transparent' : 'text-black'}`}
                    title="Due Date"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="appearance-none rounded-none w-full md:w-auto h-[52px] md:h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"
                style={{ backgroundColor: brandColor }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {isAdding ? 'ADDING TASK' : 'ADD TASK'}
              </button>
            </div>
          </form>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide after:content-[''] after:w-2 after:shrink-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            {['today', 'all', 'todo', 'in-progress', 'ideas', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-[10px] font-headline font-bold uppercase whitespace-nowrap transition-colors border-2 border-black ${
                  filter === f ? 'bg-primary-container text-white' : 'bg-surface-container-lowest text-black hover:bg-surface-container-high'
                }`}
              >
                {f === 'todo' ? 'TO-DO' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full bg-white select-none">
          <table className="w-full text-left font-body text-xs border-collapse min-w-[800px]">
            <thead className="bg-neutral-100 font-headline uppercase text-[9px] md:text-[11px] tracking-wider">
              <tr className="border-b-2 border-black">
                <th className="px-4 py-3 font-bold border-r border-black w-36">Status</th>
                <th className="px-4 py-3 font-bold border-r border-black w-32">Priority</th>
                <th className="px-4 py-3 font-bold border-r border-black">Task Title</th>
                <th className="px-4 py-3 font-bold border-r border-black w-40">Due Date</th>
                <th className="px-4 py-3 font-bold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-headline font-bold text-xs uppercase tracking-wide">
                    No tasks found for this view.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => (
                  <tr key={task.id} className={`border-b-2 border-black transition-colors ${task.status === 'completed' ? 'bg-neutral-50/50' : 'hover:bg-neutral-50'}`}>
                    <td className="px-4 py-3 border-r border-black">
                      <div className="relative inline-block">
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          className={`appearance-none pr-6 px-2 py-1 text-[9px] font-headline font-bold uppercase tracking-wider border-2 border-black cursor-pointer outline-none focus:ring-2 focus:ring-black/5 ${statusColors[task.status] || ''}`}
                        >
                          <option value="todo">TO-DO</option>
                          <option value="in-progress">IN PROGRESS</option>
                          <option value="ideas">IDEAS</option>
                          <option value="completed">COMPLETED</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-black">
                          <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L5 6L10 0H0Z" fill="currentColor"/></svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-black">
                      <div className="relative inline-block">
                        <select
                          value={task.priority || 'medium'}
                          onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                          className={`appearance-none pr-6 px-2 py-1 text-[9px] font-headline font-bold uppercase tracking-wider border-2 border-black cursor-pointer outline-none focus:ring-2 focus:ring-black/5 ${priorityColors[task.priority || 'medium'] || ''}`}
                        >
                          <option value="high">HIGH</option>
                          <option value="medium">MEDIUM</option>
                          <option value="low">LOW</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-black">
                          <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L5 6L10 0H0Z" fill="currentColor"/></svg>
                        </div>
                      </div>
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
                        <span className={`font-medium ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-black'}`}>
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
                                setEditPriority(task.priority || 'medium');
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
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 md:p-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-highest mt-auto">
            <span className="font-body font-bold text-xs md:text-sm uppercase tracking-tight">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredTasks.length, currentPage * itemsPerPage)} of {filteredTasks.length} Entries
            </span>
            <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 border border-black bg-surface-container-lowest font-bold text-xs hover:bg-surface-container-high disabled:opacity-50 transition-colors uppercase">PREV</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-2.5 py-1 border border-black font-bold text-xs transition-colors ${currentPage === i + 1 ? 'bg-neutral-200 text-black font-extrabold' : 'bg-surface-container-lowest hover:bg-surface-container-high'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 border border-black bg-surface-container-lowest font-bold text-xs hover:bg-surface-container-high disabled:opacity-50 transition-colors uppercase">NEXT</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
