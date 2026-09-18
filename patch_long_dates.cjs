const fs = require('fs');

const dateHelper = `((d) => { const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yy = String(d.getFullYear()).slice(-2); return \`\${dd}/\${mm}/\${yy}\`; })`;

function replaceLongDate(file, regex) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, `${dateHelper}(new Date())`);
  fs.writeFileSync(file, content);
  console.log('Patched', file);
}

replaceLongDate('src/components/AgreementStudio.tsx', /new Date\(\)\.toLocaleDateString\('en-US', \{ month: 'long', day: 'numeric', year: 'numeric' \}\)/g);

let contentDoc = fs.readFileSync('src/pages/DocumentView.tsx', 'utf8');
contentDoc = contentDoc.replace(/new Date\(agreement.createdAt \|\| Date.now\(\)\).toLocaleDateString\('en-US', \{ month: 'long', day: 'numeric', year: 'numeric' \}\)/g, `${dateHelper}(new Date(agreement.createdAt || Date.now()))`);
fs.writeFileSync('src/pages/DocumentView.tsx', contentDoc);

let contentInv = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');
contentInv = contentInv.replace(/d\.toLocaleDateString\('en-US', \{ month: 'long', day: 'numeric', year: 'numeric' \}\)/g, `${dateHelper}(d)`);
fs.writeFileSync('src/pages/Invoices.tsx', contentInv);

let contentAg = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');
contentAg = contentAg.replace(/new Date\(\s*agreement\.createdAt \|\| Date\.now\(\),\s*\)\.toLocaleDateString\("en-US", \{\s*month: "long",\s*day: "numeric",\s*year: "numeric",\s*\}\)/gm, `${dateHelper}(new Date(agreement.createdAt || Date.now()))`);
fs.writeFileSync('src/pages/AgreementView.tsx', contentAg);

