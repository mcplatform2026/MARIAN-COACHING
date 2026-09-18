const fs = require('fs');
let code = fs.readFileSync('src/components/DataMigrationModal.tsx', 'utf8');

if (!code.includes('        tasks,')) {
  code = code.replace(
    "        invoices,\n        settings: {",
    "        invoices,\n        tasks,\n        settings: {"
  );
  fs.writeFileSync('src/components/DataMigrationModal.tsx', code);
  console.log('Added tasks to json');
}
