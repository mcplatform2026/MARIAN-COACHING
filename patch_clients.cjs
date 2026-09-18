const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

code = code.replace(
  `                         const strVal = String(val || '');`,
  `                         const strVal = String(displayVal || '');`
);

fs.writeFileSync('src/pages/Clients.tsx', code);
