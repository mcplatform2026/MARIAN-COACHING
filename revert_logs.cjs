const fs = require('fs');

function revertLog(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    // We replaced setDoc(ARG1, with setDoc(ARG1, (console.log(...), 
    // This is tricky to undo. It's better to just git checkout them if possible, but no git.
    
    // Original: setDoc(docRef, data);
    // Modified: setDoc(docRef, (console.log("..."), data);
    
    code = code.replace(/setDoc\(([^,]+),\s*\(console\.log\([^)]+\),\s*/g, 'setDoc($1, ');
    fs.writeFileSync(file, code);
  }
}

revertLog('src/components/CloudStorageSync.tsx');
revertLog('src/components/BrandSync.tsx');
revertLog('src/pages/Invoices.tsx');
revertLog('src/pages/Sessions.tsx');
