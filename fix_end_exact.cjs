const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

let returnBlock = code.substring(code.indexOf('return (', code.lastIndexOf('if (!agreement)')));

let open = 0;
let missing = 0;
let lines = returnBlock.split('\n');

for(let line of lines) {
  open += (line.match(/<div/g) || []).length;
  open -= (line.match(/<\/div>/g) || []).length;
}
console.log('Open divs at end:', open);
