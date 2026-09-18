const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const returnBody = code.substring(code.indexOf('return (', code.lastIndexOf('if (!agreement) return null;')));
let openDivs = 0;
let lines = returnBody.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/<div/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  openDivs += (openCount - closeCount);
  if (i > lines.length - 30) {
    console.log(`Line ${i}: open=${openDivs} | ${line.trim()}`);
  }
}
console.log("Final open divs:", openDivs);
