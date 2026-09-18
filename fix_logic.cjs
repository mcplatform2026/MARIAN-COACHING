const fs = require('fs');
let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

content = content.replace(
  /\{bookingMode === 'live' && !editingId \? \(/g,
  `{!editingId ? (`
);

fs.writeFileSync('src/pages/Sessions.tsx', content);
console.log("Success");
