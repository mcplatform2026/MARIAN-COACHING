const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Remove Reset to Defaults button
code = code.replace(/\{\(hexColor\.toLowerCase\(\) !== '#6933ff'[\s\S]*?Reset to Defaults\s*<\/button>\s*\)\}/, '');

// 2. Increase text size and slightly adjust height for the collaborator input and button
// Old input: className="flex-1 h-5.5 px-1.5 text-[9px] border-2 border-black bg-white focus:outline-none normal-case font-body text-black min-w-0"
// New input: className="flex-1 h-6 px-1.5 text-xs border-2 border-black bg-white focus:outline-none normal-case font-body text-black min-w-0"
code = code.replace(
  /className="flex-1 h-5\.5 px-1\.5 text-\[9px\] border-2 border-black bg-white focus:outline-none normal-case font-body text-black min-w-0"/,
  'className="flex-1 h-7 px-2 text-[12px] border-2 border-black bg-white focus:outline-none normal-case font-body text-black min-w-0"'
);

// Old button: className="px-1.5 h-5.5 border-2 border-black bg-white text-black active:bg-gray-100 hover:bg-neutral-100 font-bold text-[8px] flex items-center justify-center shrink-0"
// New button: className="px-2 h-7 border-2 border-black bg-white text-black active:bg-gray-100 hover:bg-neutral-100 font-bold text-[10px] flex items-center justify-center shrink-0"
code = code.replace(
  /className="px-1\.5 h-5\.5 border-2 border-black bg-white text-black active:bg-gray-100 hover:bg-neutral-100 font-bold text-\[8px\] flex items-center justify-center shrink-0"/,
  'className="px-2 h-7 border-2 border-black bg-white text-black active:bg-gray-100 hover:bg-neutral-100 font-bold text-[10px] flex items-center justify-center shrink-0"'
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Sidebar updated');
