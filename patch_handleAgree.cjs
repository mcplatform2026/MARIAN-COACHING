const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const target = `      localStorage.setItem(\`agreement_\${id}_status\`, "Signed");
      const docRef = doc(db, \`users/\${uid}/agreements/\${id}\`);`;

const replacement = `      localStorage.setItem(\`agreement_\${finalId}_status\`, "Signed");
      const docRef = doc(db, \`users/\${finalUid}/agreements/\${finalId}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/AgreementView.tsx', code);
