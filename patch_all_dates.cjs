const fs = require('fs');

const formatReplacement = `const formatDateToDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return dateStr === undefined ? undefined : '';
  if (/^\\d{2}\\/\\d{2}\\/\\d{2}$/.test(dateStr)) return dateStr;
  if (/^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(dateStr)) {
    const p = dateStr.split('/');
    return \`\${p[0]}/\${p[1]}/\${p[2].slice(-2)}\`;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return \`\${parts[2]}/\${parts[1]}/\${parts[0].slice(-2)}\`;
  }
  return dateStr;
};`;

const files = ['src/pages/Dashboard.tsx', 'src/pages/Clients.tsx', 'src/pages/Sessions.tsx'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // We need to replace the old formatDateToDDMMYYYY block
  const oldRegex = /const formatDateToDDMMYYYY = \([^]*?return dateStr;\n};/;
  content = content.replace(oldRegex, formatReplacement);
  fs.writeFileSync(file, content);
  console.log('Patched', file);
});
