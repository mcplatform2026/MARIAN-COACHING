const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const returnBody = code.substring(code.indexOf('return ('));
let lines = returnBody.split('\n');
let openCount = 0;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  if(line.includes('<div') || line.includes('</div')) {
     const opened = (line.match(/<div/g) || []).length;
     const closed = (line.match(/<\/div>/g) || []).length;
     openCount += opened - closed;
     if(i > lines.length - 40) console.log(`[${i}] open: ${openCount} | ${line.trim()}`);
  }
}
