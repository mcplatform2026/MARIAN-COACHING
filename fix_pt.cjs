const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Remove className="pt-1.5" from the logo wrapper
  code = code.replace(/<div className="pt-1\.5">/g, '<div>');

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
