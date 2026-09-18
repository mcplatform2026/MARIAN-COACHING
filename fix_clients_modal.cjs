const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

code = code.replace(
  /className=\{`w-full h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium \$\{field\.type === 'date' \? 'uppercase' : ''\}`\}/g,
  'className={`w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium ${field.type === \'date\' ? \'\' : \'\'}`}'
);

fs.writeFileSync('src/pages/Clients.tsx', code);
console.log('Patched src/pages/Clients.tsx');
