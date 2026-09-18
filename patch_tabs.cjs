const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

code = code.replace(
  "{['all', 'draft', 'sent', 'viewed', 'accepted'].map(f => (",
  "{['all', 'draft', 'accepted'].map(f => ("
);

fs.writeFileSync('src/pages/Agreements.tsx', code);
