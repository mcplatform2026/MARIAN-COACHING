const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
content = content.replace('    </div>\n  );\n}', '    </div>\n    </>\n  );\n}');
fs.writeFileSync('src/pages/AgreementView.tsx', content);
