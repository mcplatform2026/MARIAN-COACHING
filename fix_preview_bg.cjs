const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

content = content.replace(
  /style={{ backgroundColor: themes.white.bg }}/,
  'style={{ backgroundColor: "#F0F3F6" }}'
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
