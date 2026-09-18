const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // We need to fix the CSS that forces these flex containers into block layout
  code = code.replace(
    /\.signatures-block, \.header-block\s*\{\s*page-break-inside:\s*avoid\s*!important;\s*break-inside:\s*avoid\s*!important;\s*display:\s*block\s*!important;\s*\}/g,
    `.signatures-block, .header-block { \n                    page-break-inside: avoid !important; \n                    break-inside: avoid !important; \n                    display: flex !important;\n                  }`
  );

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
