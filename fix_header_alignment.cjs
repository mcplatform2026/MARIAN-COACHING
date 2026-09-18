const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Replace items-start with items-center in header-block
  code = code.replace(/className="flex justify-between items-start mb-8 header-block"/g, 'className="flex justify-between items-center mb-8 header-block"');
  
  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
