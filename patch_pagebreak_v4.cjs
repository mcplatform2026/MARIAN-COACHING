const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // mode: ['css', 'legacy'] -> mode: ['avoid-all', 'css', 'legacy']
  code = code.replace(
    /pagebreak:\s*\{\s*mode:\s*\['css',\s*'legacy'\]/g,
    "pagebreak: { mode: ['avoid-all', 'css', 'legacy']"
  );

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
