const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

code = code.replace(
  /<select\s+value=\{val \|\| 'Active'\}\s+onChange=\{e => setVal\(e\.target\.value\)\}\s+className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium"/g,
  `<select 
                        value={val || 'Active'} 
                        onChange={e => setVal(e.target.value)} 
                        className="w-full box-border min-w-0 rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium"`
);

fs.writeFileSync('src/pages/Clients.tsx', code);
console.log('Patched select in src/pages/Clients.tsx');
