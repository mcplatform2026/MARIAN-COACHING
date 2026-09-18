const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  '<tr className="border-b-2 border-black bg-surface-container-low text-xs uppercase tracking-widest text-[#434655]">\n                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-28">Invoice No.</th>\n                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant">Billed To</th>\n                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-32">Date Issued</th>\n                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-36">Total Amount</th>\n                       <th className="p-4 font-bold text-center w-40">Actions</th>\n                     </tr>',
  '<tr className="border-b-2 border-black bg-surface-container-low text-[11px] uppercase tracking-wider text-[#434655]">\n                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Invoice No.</th>\n                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Billed To</th>\n                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Date Issued</th>\n                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Total Amount</th>\n                       <th className="px-2 py-3 font-bold text-center whitespace-nowrap">Actions</th>\n                     </tr>'
);

code = code.replace(
  '<Clock className="w-3.5 h-3.5 text-neutral-400" />\n                               {inv.invoiceDate || \'N/A\'}',
  '<Clock className="w-3.5 h-3.5 text-neutral-400" />\n                               {inv.invoiceDate ? formatDateToDDMMYYYY(inv.invoiceDate) : \'N/A\'}'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Patched Dashboard.tsx');
