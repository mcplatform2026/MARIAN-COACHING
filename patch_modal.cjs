const fs = require('fs');
const file = 'src/components/DataMigrationModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldModalFormatter = `  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return \`\${parts[2]}-\${parts[1]}-\${parts[0]}\`;
  };`;

const newModalFormatter = `  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '--';
    if (/^\\d{2}\\/\\d{2}\\/\\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) return \`\${parts[2]}/\${parts[1]}/\${parts[0].slice(-2)}\`;
    return dateStr;
  };`;

content = content.replace(oldModalFormatter, newModalFormatter);
fs.writeFileSync(file, content);
console.log('Patched modal');
