const fs = require('fs');
const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/type: 'jpeg', quality: 0.98/g, "type: 'jpeg' as const, quality: 0.98");
  fs.writeFileSync(file, content);
});
console.log('fixed types');
