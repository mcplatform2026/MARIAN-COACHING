const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

// Find the select div
code = code.replace(
  'className="relative inline-flex items-center flex-1 md:w-[110px] h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"',
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"'
);

// Find the date div
code = code.replace(
  'className="relative inline-flex items-center flex-1 md:w-[130px] h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"',
  'className="relative inline-flex items-center flex-1 md:flex-none md:w-32 h-11 md:h-9 border-2 border-black bg-white focus-within:border-primary-container"'
);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
console.log('Fixed');
