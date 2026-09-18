const fs = require('fs');
const file = 'src/components/DataMigrationModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldModalTs = `  const formatDateFromTimestamp = (ts: any) => {
    if (!ts) return '--';
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
    return new Date(ts).toLocaleDateString();
  };`;

const newModalTs = `  const formatDateFromTimestamp = (ts: any) => {
    if (!ts) return '--';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return \`\${day}/\${month}/\${year}\`;
  };`;

content = content.replace(oldModalTs, newModalTs);
fs.writeFileSync(file, content);
console.log('Patched modal ts');
