const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
let returnBlock = code.substring(code.indexOf('return (', code.lastIndexOf('if (!agreement)')));
fs.writeFileSync('dump.txt', returnBlock);
