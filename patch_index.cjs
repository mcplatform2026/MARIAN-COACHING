const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<title>ARYANN DESIGNS</title>',
  '<title>PRA:ANTA OS</title>\n    <meta property="og:title" content="PRA:ANTA OS" />\n    <meta property="og:type" content="website" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="PRA:ANTA OS" />'
);

fs.writeFileSync('index.html', code);
console.log('Patched index.html');
