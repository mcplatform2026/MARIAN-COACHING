const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const target = `  useEffect(() => {
    const fetchAgreement = async () => {
      if (!uid || !id) return;`;

const replacement = `  useEffect(() => {
    const fetchAgreement = async () => {
      if (!id) return;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
console.log('Patched AgreementView loading issue');
