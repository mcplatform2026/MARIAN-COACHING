const fs = require('fs');

['src/pages/AgreementView.tsx', 'src/pages/DocumentView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style=\{\{ fontFamily: 'var\(--font-headline-family\)' \}\}>Signatures & Execution<\/h3>\s*/g, '');
  fs.writeFileSync(file, content);
});
console.log('Fixed titles');
