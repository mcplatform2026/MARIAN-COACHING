const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

// 1. Task field height: it was appearance-none rounded-none flex-1 w-full min-w-0 h-[52px] md:h-9 px-4 ...
code = code.replace(
  'className="appearance-none rounded-none flex-1 w-full min-w-0 h-[52px] md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"',
  'className="appearance-none rounded-none flex-1 w-full min-w-0 min-h-[52px] md:min-h-0 h-[52px] md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"'
);

// 2. Date tab DD-MM-YYYY placeholder
const oldDateDiv = `<div className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container">
                  <Calendar size={14} className="absolute left-2 text-black pointer-events-none" />
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="appearance-none w-full h-full pl-[25px] pr-0 py-0 bg-transparent font-body text-xs tracking-tighter outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    title="Due Date"
                  />
                </div>`;

const newDateDiv = `<div className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container overflow-hidden">
                  <Calendar size={14} className="absolute left-2 text-black pointer-events-none z-10" />
                  {!newTaskDate && (
                    <span className="absolute left-[26px] text-xs font-bold font-body text-neutral-500 uppercase tracking-tighter pointer-events-none z-0">
                      DD-MM-YYYY
                    </span>
                  )}
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="relative z-20 appearance-none w-full h-full pl-[25px] pr-0 py-0 bg-transparent font-body text-xs tracking-tighter outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer text-black"
                    title="Due Date"
                  />
                </div>`;

code = code.replace(oldDateDiv, newDateDiv);

// 3. Ideas tab scrolling
code = code.replace(
  '<div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide" style={{ WebkitOverflowScrolling: \'touch\' }}>',
  '<div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide after:content-[\'\'] after:w-2 after:shrink-0" style={{ WebkitOverflowScrolling: \'touch\' }}>'
);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('TaskTracker fixed');
