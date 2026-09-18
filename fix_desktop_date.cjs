const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

const oldClass = 'className="relative z-20 appearance-none w-full h-full pl-[25px] pr-0 py-0 bg-transparent font-body text-xs tracking-tighter outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer text-black"';

const newClass = 'className={`relative z-20 appearance-none w-full h-full pl-[25px] pr-0 py-0 bg-transparent font-body text-xs tracking-tighter outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!newTaskDate ? \'text-transparent\' : \'text-black\'}`}';

code = code.replace(oldClass, newClass);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('Fixed desktop date overlap');
