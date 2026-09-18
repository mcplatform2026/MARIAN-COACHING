const fs = require('fs');

const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace border-neutral-300 with a hex equivalent in the main container
  content = content.replace(
    /className="w-full w-\[210mm\] bg-white border border-neutral-300 shadow-xl relative"/g,
    'className="w-full w-[210mm] bg-white border border-[#d4d4d8] shadow-xl relative"'
  );

  fs.writeFileSync(file, content);
});

console.log('fixed oklch elements 2');
