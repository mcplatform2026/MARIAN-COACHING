const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // We are going to replace the current avoid styles:
  // .studio-tiptap p, .studio-tiptap li, .audit-trail-block { page-break-inside: avoid; break-inside: avoid; }
  
  const badStyleRegex = /\.studio-tiptap p, \.studio-tiptap li, \.audit-trail-block \{ page-break-inside: avoid; break-inside: avoid; \}/g;
  
  const newStyle = '.studio-tiptap p, .studio-tiptap li, .audit-trail-block, .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; display: inline-block !important; width: 100% !important; }\\n              .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap h3 { page-break-after: avoid !important; break-after: avoid !important; }';

  code = code.replace(badStyleRegex, newStyle);
  
  // Also we want to ensure .audit-trail-block has page-break-inside avoid by default just in case
  code = code.replace(
    /className="mt-12 p-4 border-2 border-dashed audit-trail-block"/g,
    'className="mt-12 p-4 border-2 border-dashed audit-trail-block"' // already done
  );
  
  // Fix literal \n
  code = code.replace(/\\n/g, '\n');

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
