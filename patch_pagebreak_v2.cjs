const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /pagebreak:\s*\{\s*mode:\s*'css',\s*avoid:\s*\[[^\]]+\]\s*\}/g,
    "pagebreak: { mode: ['css', 'legacy'], avoid: ['.signatures-block', '.header-block', '.audit-trail-block', 'p', 'h1', 'h2', 'h3', 'li'] }"
  );

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
