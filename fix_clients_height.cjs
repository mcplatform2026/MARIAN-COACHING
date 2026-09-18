const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

code = code.replace(
  'className="w-full pl-8 pr-3 py-1.5 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container transition-colors"',
  'className="w-full h-[36px] md:h-[40px] pl-8 pr-3 py-1.5 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container transition-colors"'
);

code = code.replace(
  "className={`p-1.5 border-2 border-black flex items-center justify-center transition-all ${isTableLocked ? 'bg-surface-container-lowest text-black hover:bg-surface-container-high' : 'bg-primary-container text-white'} `}",
  "className={`h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all ${isTableLocked ? 'bg-surface-container-lowest text-black hover:bg-surface-container-high' : 'bg-primary-container text-white'} `}"
);

code = code.replace(
  'className="p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest text-black hover:bg-surface-container-high"',
  'className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest text-black hover:bg-surface-container-high"'
);

code = code.replace(
  'className="p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest hover:bg-surface-container-high text-black"',
  'className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest hover:bg-surface-container-high text-black"'
);

fs.writeFileSync('src/pages/Clients.tsx', code);
console.log('Fixed heights');
