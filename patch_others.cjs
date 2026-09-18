const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/return \`\$\{day\} - \$\{month\} - \$\{year\}\`;/g, "return \`\${day}/\${month}/\${year.toString().slice(-2)}\`;");
  fs.writeFileSync(file, content);
  console.log('Patched', file);
}

patch('src/pages/TaskTracker.tsx');
patch('src/pages/Agreements.tsx');
patch('src/pages/Invoices.tsx');
