const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Add pdf-text-right to the container
content = content.replace(
  '<div className="text-left sm:text-right w-full sm:w-auto">',
  '<div className="text-left sm:text-right w-full sm:w-auto pdf-text-right">'
);

// Add pdf-text-right to the style block
content = content.replace(
  '.pdf-clone .pdf-text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; text-align: right !important; }',
  '.pdf-clone .pdf-text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; text-align: right !important; }\n  .pdf-clone .pdf-text-right { text-align: right !important; }'
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
