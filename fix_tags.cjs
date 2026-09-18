const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// replace the end with enough closing tags
const tailRegex = /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/s;
content = content.replace(tailRegex, '</div>\n</div>\n</div>\n</div>\n</div>\n  );\n}');

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
