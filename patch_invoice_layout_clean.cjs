const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

// 1. Change background to white
code = code.replace(
  '<div className="min-h-screen bg-neutral-100 font-body flex flex-col items-center">',
  '<div className="min-h-screen bg-white font-body flex flex-col items-center">'
);

// 2. Change navbar border and text
code = code.replace(
  '{invoice.brandNamePart1} <span className="text-neutral-400">{invoice.brandNamePart2}</span>',
  '{invoice.logoImage ? "INVOICE DOCUMENT" : <>{invoice.brandNamePart1} <span className="text-neutral-400">{invoice.brandNamePart2}</span></>}'
);

code = code.replace(
  'className="w-full bg-white border-b-2 border-black p-4 sticky top-0 z-50 shadow-sm flex items-center justify-between lg:px-12"',
  'className="w-full bg-white border-b border-neutral-200 p-4 sticky top-0 z-50 shadow-sm flex items-center justify-between lg:px-12"'
);

// 3. Remove outer max-w padding to make it full width if possible
code = code.replace(
  '<div className="w-full max-w-[850px] p-4 py-8 overflow-x-auto">',
  '<div className="w-full max-w-[850px] p-0 md:p-8 overflow-x-auto mx-auto flex-1 flex flex-col">'
);

// 4. Clean up the capture area
code = code.replace(
  'className="mx-auto px-8 pt-8 pb-8 shadow-lg border-2 w-[794px] shrink-0 flex flex-col transition-colors duration-150 relative overflow-hidden bg-white"',
  'className="mx-auto px-6 md:px-12 pt-8 pb-12 w-full max-w-[794px] shrink-0 flex-1 flex flex-col transition-colors duration-150 relative overflow-hidden bg-white"'
);

// Fix the 600px width I might have applied
code = code.replace(
  'className="mx-auto px-8 pt-8 pb-8 shadow-lg border-2 w-[600px] shrink-0 flex flex-col transition-colors duration-150 relative overflow-hidden bg-white"',
  'className="mx-auto px-6 md:px-12 pt-8 pb-12 w-full max-w-[794px] shrink-0 flex-1 flex flex-col transition-colors duration-150 relative overflow-hidden bg-white"'
);

// Remove the shadow and border from the inline if any exists
code = code.replace(/shadow-lg border-2/g, '');

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
