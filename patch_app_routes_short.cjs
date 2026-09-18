const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('path="/i/:id"')) {
  code = code.replace(
    '<Route path="/inv/:uid/:id" element={<InvoiceView />} />',
    '<Route path="/inv/:uid/:id" element={<InvoiceView />} />\n        <Route path="/i/:id" element={<InvoiceView />} />\n        <Route path="/a/:id" element={<AgreementView />} />'
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App routes for very short links');
}
