const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Signatures Block
content = content.replace(
  '<div className="flex flex-row gap-12 w-full">',
  '<div className="flex flex-col sm:flex-row gap-12 sm:gap-12 w-full pdf-flex-row">'
);

// Provider/Client sig wrapper
// There are TWO of these: <div className="flex-1 w-1/2 flex flex-col items-center">
content = content.replace(
  /<div className="flex-1 w-1\/2 flex flex-col items-center">/g,
  '<div className="flex-1 w-full sm:w-1/2 flex flex-col items-center pdf-w-half">'
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
