const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

const targetDateLogic = `{agreement.status === 'accepted' && agreement.acceptedAt ? (
                          new Date(agreement.acceptedAt).toLocaleDateString()
                        ) : (
                          '--'
                        )}`;

const formatFunc = `const formatSignedDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return \`\${day} - \${month} - \${year}\`;
};`;

const replacementDateLogic = `{agreement.status === 'accepted' && agreement.acceptedAt ? (
                          formatSignedDate(agreement.acceptedAt)
                        ) : (
                          '--'
                        )}`;

if (code.includes(targetDateLogic)) {
    code = code.replace(targetDateLogic, replacementDateLogic);
    
    // Fallback injection
    const lastImport = code.lastIndexOf('import ');
    const endOfLastImport = code.indexOf('\n', lastImport);
    code = code.slice(0, endOfLastImport + 1) + '\n' + formatFunc + '\n' + code.slice(endOfLastImport + 1);
    
    fs.writeFileSync('src/pages/Agreements.tsx', code);
    console.log("Success");
} else {
    console.log("Failed to find target");
}
