const fs = require('fs');

// 1. App.tsx Routes
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (!appTsx.includes('path="/i/:id"')) {
  appTsx = appTsx.replace(
    '<Route path="/inv/:uid/:id" element={<InvoiceView />} />',
    '<Route path="/inv/:uid/:id" element={<InvoiceView />} />\n        <Route path="/i/:id" element={<InvoiceView />} />\n        <Route path="/a/:id" element={<AgreementView />} />'
  );
  fs.writeFileSync('src/App.tsx', appTsx);
}

// 2. AuthProvider bypass
let authProv = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');
if (!authProv.includes("startsWith('/i/')")) {
  authProv = authProv.replace(
    "|| window.location.pathname.startsWith('/inv') || window.location.pathname.startsWith('/invoice');",
    "|| window.location.pathname.startsWith('/inv') || window.location.pathname.startsWith('/invoice') || window.location.pathname.startsWith('/i/') || window.location.pathname.startsWith('/a/');"
  );
  fs.writeFileSync('src/components/AuthProvider.tsx', authProv);
}
console.log('Setup basic routes');
