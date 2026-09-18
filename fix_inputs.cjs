const fs = require('fs');

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('input[type="date"]')) {
  css += `\n
@layer base {
  input[type="date"], input[type="time"], input[type="datetime-local"], input[type="month"], input[type="week"] {
    appearance: none;
    -webkit-appearance: none;
    min-width: 0;
    box-sizing: border-box;
    border-radius: 0;
  }
}
`;
  fs.writeFileSync(cssPath, css);
  console.log('Patched index.css');
}
