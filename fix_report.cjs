const fs = require('fs');
const file = 'src/pages/MonthlyReport.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = 'import { KeyMetricsSnapshot } from "../components/KeyMetricsSnapshot";';

const helper = `const getFormattedCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return \`\${day}/\${month}/\${year}\`;
};`;

if (content.includes(targetImport)) {
  content = content.replace(targetImport, targetImport + '\n\n' + helper + '\n');
  fs.writeFileSync(file, content);
  console.log('Fixed monthly report');
} else {
  console.log('Target import not found');
}
