const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
const prettier = require('prettier');
prettier.format(code, { parser: 'typescript' }).then(formatted => {
  fs.writeFileSync('src/pages/AgreementView.tsx.formatted', formatted);
}).catch(e => console.error(e));
