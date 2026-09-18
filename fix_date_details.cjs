const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

const oldBlock = `<Calendar size={14} className="absolute left-2 text-black pointer-events-none z-10" />
                  {!newTaskDate && (
                    <span className="absolute left-[26px] text-xs font-bold font-body text-neutral-500 uppercase tracking-tighter pointer-events-none z-0">
                      DD-MM-YYYY
                    </span>
                  )}
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className={\`relative z-20 appearance-none w-full h-full pl-[25px] pr-0 py-0 bg-transparent font-body text-xs tracking-tighter outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer \${!newTaskDate ? 'text-transparent' : 'text-black'}\`}
                    title="Due Date"
                  />`;

const newBlock = `<Calendar size={16} className="absolute left-2 text-black pointer-events-none z-10" />
                  {!newTaskDate && (
                    <span className="absolute left-[30px] text-xs font-bold font-body text-neutral-700 uppercase pointer-events-none z-0">
                      DD-MM-YYYY
                    </span>
                  )}
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className={\`relative z-20 appearance-none w-full h-full pl-[30px] pr-0 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer \${!newTaskDate ? 'text-transparent' : 'text-black'}\`}
                    title="Due Date"
                  />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('Fixed date placeholder details');
