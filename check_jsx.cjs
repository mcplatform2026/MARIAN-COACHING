const fs = require('fs');
const content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

let stack = [];
let i = 0;
while (i < content.length) {
  if (content.substring(i, i+4) === '<!--') {
    i += 4;
    while (i < content.length && content.substring(i, i+3) !== '-->') i++;
    i += 3;
    continue;
  }
  if (content.substring(i, i+2) === '/*') {
    i += 2;
    while (i < content.length && content.substring(i, i+2) !== '*/') i++;
    i += 2;
    continue;
  }
  
  if (content[i] === '<') {
    if (content[i+1] === '/') {
      let j = i + 2;
      while (j < content.length && content[j] !== '>') j++;
      let tag = content.substring(i+2, j).trim();
      stack.pop(); // assuming it matches
      i = j + 1;
    } else {
      let j = i + 1;
      let isSelfClosing = false;
      while (j < content.length && content[j] !== '>') {
        if (content[j] === '/' && content[j+1] === '>') isSelfClosing = true;
        j++;
      }
      if (!isSelfClosing) {
        let tag = content.substring(i+1, j).split(/[ \n\t>]/)[0];
        if (tag && !['img', 'br', 'hr', 'input'].includes(tag)) {
          stack.push(tag);
        }
      }
      i = j + 1;
    }
  } else {
    i++;
  }
}
console.log(stack);
