const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

code = code.replace(
  'bg-blue-600 text-white font-headline font-bold text-xs uppercase tracking-widest border-2 border-black flex items-center gap-2 hover:bg-blue-700',
  'bg-black text-white font-headline font-bold text-xs uppercase tracking-widest border-2 border-black flex items-center gap-2 hover:bg-neutral-800'
);

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
