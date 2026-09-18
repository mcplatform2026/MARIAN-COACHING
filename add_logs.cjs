const fs = require('fs');

function injectLog(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('console.log("FIRESTORE WRITE')) {
      code = code.replace(/setDoc\(([^,]+),/g, 'setDoc($1, (console.log("FIRESTORE WRITE: setDoc in " + __filename + " to " + $1?.path), ');
      fs.writeFileSync(file, code);
      console.log("Injected into " + file);
    }
  }
}

injectLog('src/components/CloudStorageSync.tsx');
injectLog('src/components/BrandSync.tsx');
injectLog('src/pages/Invoices.tsx');
injectLog('src/pages/Sessions.tsx');
