const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAgreements.ts', 'utf8');

const target = `      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Agreement);
      });`;

const replacement = `      snapshot.forEach((doc) => {
        if (!doc.id.startsWith('inv_')) {
          data.push({ id: doc.id, ...doc.data() } as Agreement);
        }
      });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/hooks/useAgreements.ts', code);
console.log('Patched useAgreements');
