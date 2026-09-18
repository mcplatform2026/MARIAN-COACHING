const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="max-h-24 mix-blend-multiply"/g, 'className="max-h-24 max-w-full object-contain mix-blend-multiply"');
  content = content.replace(/className="h-16 mix-blend-multiply"/g, 'className="h-16 max-w-full object-contain mix-blend-multiply"');
  // In SignatureCanvasBlock:
  content = content.replace(/className="max-h-32 max-w-full mix-blend-multiply"/g, 'className="max-h-32 max-w-full object-contain mix-blend-multiply"');
  fs.writeFileSync(file, content);
};

fixFile('src/pages/DocumentView.tsx');
fixFile('src/pages/AgreementView.tsx');
fixFile('src/components/AgreementStudio.tsx');
fixFile('src/components/SignatureCanvasBlock.tsx');

console.log('Fixed image classes');
