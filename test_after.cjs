const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
const afterActions = code.substring(actionsStart);
console.log(afterActions.substring(0, 500));
console.log('--- END OF FILE ---');
console.log(afterActions.substring(afterActions.length - 200));
