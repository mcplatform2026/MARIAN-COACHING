const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(/    <\/div>\s*<\/div>\s*\);\s*\}/, '    </div>\n  </div>\n  </div>\n  </div>\n  );\n}');

fs.writeFileSync('src/pages/AgreementView.tsx', code);
console.log('Patched');
