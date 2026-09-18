const fs = require('fs');

function fixLog(file, name) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/__filename/g, '"' + name + '"');
    fs.writeFileSync(file, code);
  }
}

fixLog('src/components/CloudStorageSync.tsx', 'CloudStorageSync');
fixLog('src/components/BrandSync.tsx', 'BrandSync');
fixLog('src/pages/Invoices.tsx', 'Invoices');
fixLog('src/pages/Sessions.tsx', 'Sessions');
