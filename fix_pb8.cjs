const fs = require('fs');
const files = ['src/pages/DocumentView.tsx', 'src/pages/AgreementView.tsx', 'src/components/AgreementStudio.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/border-t-2 signatures-block/g, 'pb-8 border-t-2 signatures-block');
  fs.writeFileSync(file, content);
});

console.log('Added pb-8');
