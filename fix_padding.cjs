const fs = require('fs');

['src/pages/AgreementView.tsx', 'src/pages/DocumentView.tsx', 'src/components/AgreementStudio.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/padding: 0\.75em 0 !important;/g, 'padding: 0.25em 0 !important;');
  fs.writeFileSync(file, content);
});
console.log('Fixed padding');
