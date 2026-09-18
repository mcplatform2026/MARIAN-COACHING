const fs = require('fs');

const filesToInstrument = [
  'src/components/CloudStorageSync.tsx',
  'src/components/BrandSync.tsx',
  'src/pages/Invoices.tsx',
  'src/pages/MonthlyReport.tsx',
  'src/pages/Sessions.tsx',
];

filesToInstrument.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Check if we already instrumented
    if (code.includes('console.log("FIRESTORE WRITE:')) return;
    
    // Instrument setDoc
    code = code.replace(/setDoc\(([^,]+),/g, 'setDoc($1, (console.log("FIRESTORE WRITE: setDoc in " + __filename), ');
    // We need a safer way. Let's just monkey patch setDoc in main.tsx or App.tsx
  }
});
