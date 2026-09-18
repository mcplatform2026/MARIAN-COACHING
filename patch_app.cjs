const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
code = code.replace('import { AgreementView } from "./pages/AgreementView";', 'import { AgreementView } from "./pages/AgreementView";\nimport { InvoiceView } from "./pages/InvoiceView";');

// Add route
code = code.replace('<Route path="/agreement/:uid/:id" element={<AgreementView />} />', '<Route path="/agreement/:uid/:id" element={<AgreementView />} />\n        <Route path="/invoice/:uid/:id" element={<InvoiceView />} />');

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
