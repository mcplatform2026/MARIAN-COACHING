const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useTasks, Task } from "../hooks/useTasks";
import { ListTodo, CheckCircle2, Circle, Clock, Plus, Trash2, Calendar, Filter } from "lucide-react";

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

export function TaskTracker() {
  const { tasks, loading, addTask, updateTask, removeTask } = useTasks();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed' | 'upcoming'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 
                       task.status === 'todo' ? 'in-progress' : 'completed';
    await updateTask(task.id, { status: nextStatus });
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
        <div className="bg-secondary-container border-b-2 border-black p-3 md:p-4 flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
          
          {/* Compact Add Task Form */}
          <form onSubmit={handleAddTask} className="flex-1 flex flex-col sm:flex-row w-full gap-2 lg:max-w-3xl">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[200px] h-9 px-3 border-2 border-black font-body text-xs outline-none focus:border-primary-container transition-colors"
              required
            />
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="h-9 px-3 border-2 border-black font-body text-xs outline-none focus:border-primary-container uppercase font-bold w-[130px] bg-white"
                  title="Due Date"
                />
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-[10px] border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 active:translate-y-0.5"
                style={{ backgroundColor: brandColor }}
              >
                <Plus size={14} strokeWidth={2.5} />
                {isAdding ? 'ADDING' : 'ADD'}
              </button>
            </div>
          </form>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={16} className="text-neutral-500 hidden sm:block" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="h-9 px-3 border-2 border-black font-headline font-bold text-[10px] uppercase bg-white outline-none focus:border-primary-container cursor-pointer min-w-[140px]"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To-Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="w-full bg-white select-none">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <ListTodo size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-headline font-bold text-xs text-neutral-400 uppercase tracking-wide">No tasks found for this view.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className={\`group flex items-center gap-3 p-3 px-4 transition-colors \${index !== filteredTasks.length - 1 ? 'border-b border-black/10' : ''} \${
                    task.status === 'completed' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                  }\`}
                >
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    ) : task.status === 'in-progress' ? (
                      <Clock size={20} className="text-orange-500" />
                    ) : (
                      <Circle size={20} className="text-neutral-300" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className={\`font-body text-sm truncate \${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-black font-medium'}\`}>
                      {task.title}
                    </span>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={\`text-[9px] uppercase font-headline font-bold px-1.5 py-0.5 border border-black \${
                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        task.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-neutral-100 text-neutral-700'
                      }\`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      
                      {task.dueDate ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase w-24 justify-end">
                          <Calendar size={12} />
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="w-24"></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 ml-2 border-2 border-transparent hover:border-black hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:outline-none"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
`;

fs.writeFileSync('src/pages/TaskTracker.tsx', content);
