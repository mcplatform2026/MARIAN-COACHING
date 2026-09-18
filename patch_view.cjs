const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// 1. Add pdf-clone class
content = content.replace(
  'const clone = element.cloneNode(true) as HTMLDivElement;\n    clone.style.width = "794px";',
  'const clone = element.cloneNode(true) as HTMLDivElement;\n    clone.classList.add("pdf-clone");\n    clone.style.width = "794px";'
);

// 2. Add style block for pdf-clone at the top of the return
const returnDivMatch = content.match(/<div\s+className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex flex-col items-center overflow-x-hidden"/);
if (returnDivMatch) {
  content = content.replace(returnDivMatch[0], 
`<style>{\`
  .pdf-clone .pdf-flex-row { flex-direction: row !important; }
  .pdf-clone .pdf-items-end { align-items: flex-end !important; }
  .pdf-clone .pdf-w-half { width: 50% !important; }
  .pdf-clone .pdf-pr-4 { padding-right: 1rem !important; }
  .pdf-clone .pdf-pl-4 { padding-left: 1rem !important; }
  .pdf-clone .pdf-text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; text-align: right !important; }
\`}</style>
      ${returnDivMatch[0]}`);
}

// 3. Header block
content = content.replace(
  '<div className="flex justify-between items-start mb-8 header-block">',
  '<div className="flex flex-col sm:flex-row justify-between items-start mb-8 header-block gap-6 sm:gap-0 pdf-flex-row">'
);

// 4. Header text right
content = content.replace(
  '<div className="text-right">\n                      <h1\n                        className="text-4xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right"',
  '<div className="text-left sm:text-right w-full sm:w-auto">\n                      <h1\n                        className="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight w-full sm:max-w-full sm:ml-auto text-left sm:text-right pdf-text-4xl"'
);

// 5. Signatures block
content = content.replace(
  '<div className="flex justify-between items-end mt-16 pt-8 border-t-2 border-black signatures-block">',
  '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-16 pt-8 border-t-2 border-black signatures-block gap-8 sm:gap-0 pdf-flex-row pdf-items-end">'
);

// 6. Provider sig wrapper
content = content.replace(
  '<div className="w-1/2 pr-4">',
  '<div className="w-full sm:w-1/2 sm:pr-4 pdf-w-half pdf-pr-4">'
);

// 7. Client sig wrapper
content = content.replace(
  '<div className="w-1/2 pl-4 flex flex-col items-end">',
  '<div className="w-full sm:w-1/2 sm:pl-4 flex flex-col items-start sm:items-end pdf-w-half pdf-pl-4 pdf-items-end">'
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
