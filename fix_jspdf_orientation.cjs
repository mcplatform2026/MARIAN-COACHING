const fs = require('fs');

const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/orientation: 'portrait'/g, "orientation: 'portrait' as const");
  fs.writeFileSync(file, content);
});

console.log('Fixed jsPDF orientation type');
