const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('<Route path="/invoice/:uid/:id" element={<InvoiceView />} />', '<Route path="/inv/:uid/:id" element={<InvoiceView />} />');

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx route');
