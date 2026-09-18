const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

code = code.replace(
  'className="flex-1 w-full min-w-0 h-11 md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"',
  'className="appearance-none rounded-none flex-1 w-full min-w-0 h-[52px] md:h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"'
);

code = code.replace(
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"',
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container"'
);

code = code.replace(
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"',
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-[52px] md:h-9 border-2 border-black bg-white focus-within:border-primary-container"'
);

code = code.replace(
  'className="w-full md:w-auto h-11 md:h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"',
  'className="appearance-none rounded-none w-full md:w-auto h-[52px] md:h-9 px-4 text-white font-headline font-bold uppercase tracking-wider text-xs border-2 border-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 active:translate-y-0.5"'
);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('Fixed mobile heights');
