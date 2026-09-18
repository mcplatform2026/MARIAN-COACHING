const fs = require('fs');
const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find "const marginY = 80;" and remove everything up to "// Using html2pdf"
  content = content.replace(/const marginY = 80;[\s\S]*?\/\/ Using html2pdf/g, '// Using html2pdf');
  
  fs.writeFileSync(file, content);
});
console.log('removed spacers');
