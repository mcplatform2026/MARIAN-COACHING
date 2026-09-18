const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

const target = `  useEffect(() => {
    const fetchInvoice = async () => {
      if (!uid || !id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        if (!uid && id) {`;

const replacement = `  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        if (!uid && id) {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Patched InvoiceView.tsx if condition');
