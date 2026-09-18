const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
const beforeActions = code.substring(0, actionsStart);
const afterActions = code.substring(actionsStart);

let cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');

// Add 9 closing divs.
cleanBefore += '\n' + '      </div>\n'.repeat(9) + '\n  ';

fs.writeFileSync('src/pages/AgreementView.tsx', cleanBefore + afterActions);
