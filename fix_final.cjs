const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Header Text Right
content = content.replace(
  /<div className="text-right">\s*<h1\s*className="text-4xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right"/g,
  `<div className="text-left sm:text-right w-full sm:w-auto">
                  <h1
                    className="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight w-full sm:max-w-full sm:ml-auto text-left sm:text-right pdf-text-4xl"`
);

// Signatures Block
content = content.replace(
  /<div className="flex justify-between items-end mt-16 pt-8 border-t-2 border-black signatures-block">/g,
  `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-16 pt-8 border-t-2 border-black signatures-block gap-8 sm:gap-0 pdf-flex-row pdf-items-end">`
);

// Provider sig wrapper
content = content.replace(
  /<div className="w-1\/2 pr-4">/g,
  `<div className="w-full sm:w-1/2 sm:pr-4 pdf-w-half pdf-pr-4">`
);

// Client sig wrapper
content = content.replace(
  /<div className="w-1\/2 pl-4 flex flex-col items-end">/g,
  `<div className="w-full sm:w-1/2 sm:pl-4 flex flex-col items-start sm:items-end pdf-w-half pdf-pl-4 pdf-items-end">`
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
