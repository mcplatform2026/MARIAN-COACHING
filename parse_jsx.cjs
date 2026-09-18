const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const returnStr = code.substring(code.indexOf('return ('));
console.log(returnStr.substring(0, 1500));
