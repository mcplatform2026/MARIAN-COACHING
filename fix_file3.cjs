const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const lastReturnMatch = content.match(/<\/div>\s*<\/div>\s*\);\s*\}/);
if (lastReturnMatch) {
  content = content.replace(lastReturnMatch[0], '</div>\n    </div>\n    </>\n  );\n}');
} else {
  // Try another match
  const altMatch = content.match(/<\/div>\s*\);\s*\}/);
  if (altMatch) {
    content = content.replace(altMatch[0], '</div>\n    </>\n  );\n}');
  }
}

fs.writeFileSync('src/pages/AgreementView.tsx', content);
