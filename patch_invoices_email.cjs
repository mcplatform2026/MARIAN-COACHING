const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Insert getEmailLink helper
if (!code.includes('const getEmailLink')) {
  code = code.replace('export function Invoices() {', 'export function Invoices() {\n  const getEmailLink = (subject: string, body: string) => {\n    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);\n    if (isMobile) {\n      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n    }\n    return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n  };\n');
}

// Update spacing in the icon container
code = code.replace('<div className="border-t-2 border-black pt-3 mt-4 flex justify-between gap-1">', '<div className="border-t-2 border-black pt-3 mt-4 flex justify-start gap-2.5">');

// Update Email link href
code = code.replace(
  'href={"https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=" + encodeURIComponent("Invoice #" + inv.invoiceNo) + "&body=" + encodeURIComponent("Please find the attached invoice PDF.")}',
  'href={getEmailLink("Invoice #" + inv.invoiceNo, "Please find the attached invoice PDF.")}'
);

// Update handleDownloadSaved to be non-blocking
const oldHandleDownloadSaved = `  const handleDownloadSaved = (invoice: SavedInvoice) => {
    // Save current active tab so we can go back
    const prevTab = activeTab;`;

const newHandleDownloadSaved = `  const handleDownloadSaved = (invoice: SavedInvoice) => {
    // Avoid blocking the main thread so links can navigate immediately
    setTimeout(() => {
      // Save current active tab so we can go back
      const prevTab = activeTab;`;

const oldHandleDownloadSavedEnd = `setTimeout(async () => {
      await handleDownloadPDF();
      // Switch back to original view immediately after snapshot
      setActiveTab(prevTab);
    }, 400);
  };`;

const newHandleDownloadSavedEnd = `setTimeout(async () => {
        await handleDownloadPDF();
        // Switch back to original view immediately after snapshot
        setActiveTab(prevTab);
      }, 400);
    }, 100);
  };`;

if (code.includes(oldHandleDownloadSaved)) {
  code = code.replace(oldHandleDownloadSaved, newHandleDownloadSaved);
  code = code.replace(oldHandleDownloadSavedEnd, newHandleDownloadSavedEnd);
}

fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Patched Invoices.tsx');
