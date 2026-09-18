const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\.signatures-block, \.header-block { \s*page-break-inside: avoid !important; \s*break-inside: avoid !important; \s*display: flex !important;\s*}/,
    `.header-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: flex !important;
                  }
                  .signatures-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: flex !important;
                    flex-direction: column !important;
                  }`
  );
  fs.writeFileSync(file, content);
}
