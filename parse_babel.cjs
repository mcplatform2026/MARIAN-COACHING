const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
let returnBlock = code.substring(code.indexOf('return (', code.lastIndexOf('if (!agreement)')));

let openCount = 0;
let lines = returnBlock.split('\n');
for(let i = 0; i < lines.length; i++) {
  openCount += (lines[i].match(/<div/g) || []).length;
  openCount -= (lines[i].match(/<\/div>/g) || []).length;
}
console.log('final open', openCount);
