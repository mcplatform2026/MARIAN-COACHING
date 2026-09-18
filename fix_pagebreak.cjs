const fs = require('fs');
const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/pagebreak:\s*\{\s*mode:\s*\['css',\s*'legacy'\]\s*\}/g, "pagebreak: { mode: 'avoid-all', avoid: ['.signatures-block', '.header-block'] }");
  fs.writeFileSync(file, content);
});
console.log('fixed pagebreak');
