const fs = require('fs');

const files = [
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Replace <div className="flex flex-col items-center"> with <div className="flex-1 w-1/2 flex flex-col items-center">
  // BUT only inside the signatures block.
  // We can just replace all of them since there might not be others, or we can use a more precise regex.
  code = code.replace(/<div className="flex flex-col items-center">/g, '<div className="flex-1 w-1/2 flex flex-col items-center">');

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
