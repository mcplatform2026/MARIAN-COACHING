const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

code = code.replace(
  'className="w-full h-full pl-7 pr-1 py-0 bg-transparent font-body text-xs outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"',
  'className="w-full h-full pl-6 pr-0 py-0 bg-transparent font-body text-[11px] md:text-xs tracking-tighter md:tracking-normal outline-none uppercase font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"'
);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('Fixed padding');
