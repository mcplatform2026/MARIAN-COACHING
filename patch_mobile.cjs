const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

const oldForm = `<form onSubmit={handleAddTask} className="relative flex-1 w-full flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 w-full min-w-0 h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"
              required
            />
            <div className="flex flex-wrap gap-3">
              <div className="relative inline-flex items-center w-32 h-9 border-2 border-black bg-white focus-within:border-primary-container">
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
              <div className="relative inline-flex items-center w-32 h-9 border-2 border-black bg-white focus-within:border-primary-container">
                <Calendar size={14} className="absolute left-2 text-black pointer-events-none" />
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full h-full pl-7 pr-1 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  title="Due Date"
                />
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"
                style={{ backgroundColor: brandColor }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {isAdding ? 'ADDING TASK' : 'ADD TASK'}
              </button>
            </div>
          </form>`;

const newForm = `<form onSubmit={handleAddTask} className="relative flex-1 w-full flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 w-full min-w-0 h-11 md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"
              required
            />
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative inline-flex items-center flex-1 md:w-[110px] h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container">
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
                <div className="relative inline-flex items-center flex-1 md:w-[130px] h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container">
                  <Calendar size={14} className="absolute left-2 text-black pointer-events-none" />
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full h-full pl-7 pr-1 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    title="Due Date"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="w-full md:w-auto h-11 md:h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"
                style={{ backgroundColor: brandColor }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {isAdding ? 'ADDING TASK' : 'ADD TASK'}
              </button>
            </div>
          </form>`;

const oldTabs = `<div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide">`;
const newTabs = `<div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>`;

code = code.replace(oldForm, newForm);
code = code.replace(oldTabs, newTabs);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('patched');
