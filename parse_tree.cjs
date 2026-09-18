const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');
let openCount = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let openMatches = line.match(/<div/g);
  let closeMatches = line.match(/<\/div>/g);
  
  if (openMatches) openCount += openMatches.length;
  if (closeMatches) openCount -= closeMatches.length;
  
  if (openCount === 0 && closeMatches) {
    console.log(`Root closed at line ${i + 1}`);
  }
}
