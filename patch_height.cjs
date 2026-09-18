const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

// 1. Fix the height of the task title input
code = code.replace(
  'className="flex-1 w-full min-w-0 px-4 py-2 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"',
  'className="flex-1 w-full min-w-0 h-9 px-4 border-2 border-black bg-white font-body text-sm outline-none focus:border-primary-container transition-colors"'
);

// 2. Add alignment to the form so the h-9 elements align centrally if in a row
code = code.replace(
  'className="relative flex-1 w-full flex flex-col md:flex-row gap-3"',
  'className="relative flex-1 w-full flex flex-col md:flex-row gap-3 md:items-center"'
);

// 3. Improve mobile padding on the main container
code = code.replace(
  'className="flex-1 p-6 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black"',
  'className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black"'
);

// 4. Improve padding on the filter/tabs container for mobile
code = code.replace(
  'className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0"',
  'className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide"'
);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
