const fs = require('fs');

const invoicesCode = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const startTag = '<div \n              id="invoice-capture-area"';
let startIdx = invoicesCode.indexOf(startTag);
if (startIdx === -1) {
  console.log("Could not find capture area");
  process.exit(1);
}

// We need to find the matching closing tag for this div
let openDivs = 0;
let endIdx = -1;
let inString = false;
let stringChar = '';

for (let i = startIdx; i < invoicesCode.length; i++) {
  const c = invoicesCode[i];
  
  if (!inString && (c === '"' || c === "'")) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar) {
    inString = false;
  }
  
  if (!inString) {
    if (invoicesCode.substring(i, i+4) === '<div') {
      openDivs++;
    } else if (invoicesCode.substring(i, i+6) === '</div') {
      openDivs--;
      if (openDivs === 0) {
        endIdx = i + 6;
        break;
      }
    }
  }
}

let captureAreaHtml = invoicesCode.substring(startIdx, endIdx);

// Now we need to replace all state variables with invoice.variable
// state variables used in Invoices.tsx inside capture area:
const varsToReplace = [
  'invoiceTheme',
  'invoiceTypography',
  'logoImage',
  'brandNamePart1',
  'brandNamePart2',
  'billedToName',
  'billedToEmail',
  'invoiceDate',
  'invoiceNo',
  'items',
  'currencySymbol',
  'totalAmount',
  'exactTerms',
  'paymentDetails',
  'subtextStyle',
  'signatureImage',
  'signatureWritten',
  'signatureFontClass',
  'signatureName',
  'thankYouMessage',
  'phone',
  'email',
  'website'
];

for (const v of varsToReplace) {
  // Replace `{v}` or `{v ` or ` v }` or `v ?` or `v ===` etc with `invoice.v`
  // A safer regex: \bvariable\b but only outside of quotes
  // Since it's JSX, variables are usually in curly braces { } or template literals ${ } or just JS expressions.
  // We'll replace it with invoice.v
  
  const regex = new RegExp(`\\b${v}\\b`, 'g');
  captureAreaHtml = captureAreaHtml.replace(regex, `invoice.${v}`);
}

// Fix themes if they are not imported in InvoiceView
// Wait, InvoiceView needs `themes` object
const themesObjStr = `const themes: Record<string, any> = {
  white: { bg: '#ffffff', text: '#000000', border: '#000000', rowSeparator: '#e5e5e5' },
  alabaster: { bg: '#FAFAF8', text: '#1A1A1A', border: '#1A1A1A', rowSeparator: '#e5e5e5' },
  nordic: { bg: '#F0F4F8', text: '#2D3748', border: '#2D3748', rowSeparator: '#cbd5e0' },
  sage: { bg: '#F4F5F0', text: '#2C3329', border: '#2C3329', rowSeparator: '#d1d5db' },
};`;

// Also fix formatDateForPDF which might not be defined
const formatDateFuncStr = `const formatDateForPDF = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
};`;

// Now create the new InvoiceView.tsx
let invoiceViewCode = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

// Find the old capture area in InvoiceView
let oldStartIdx = invoiceViewCode.indexOf('<div \n          id="invoice-capture-area"');
if (oldStartIdx === -1) {
  oldStartIdx = invoiceViewCode.indexOf('<div\n          id="invoice-capture-area"');
}
if (oldStartIdx === -1) {
  oldStartIdx = invoiceViewCode.indexOf('<div id="invoice-capture-area"');
}
if (oldStartIdx === -1) {
  oldStartIdx = invoiceViewCode.indexOf('        <div \n          id="invoice-capture-area"');
}

if (oldStartIdx === -1) {
  console.log("Could not find old capture area in InvoiceView");
  process.exit(1);
}

openDivs = 0;
let oldEndIdx = -1;
inString = false;

for (let i = oldStartIdx; i < invoiceViewCode.length; i++) {
  const c = invoiceViewCode[i];
  if (!inString && (c === '"' || c === "'")) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar) {
    inString = false;
  }
  if (!inString) {
    if (invoiceViewCode.substring(i, i+4) === '<div') openDivs++;
    else if (invoiceViewCode.substring(i, i+6) === '</div') {
      openDivs--;
      if (openDivs === 0) {
        oldEndIdx = i + 6;
        break;
      }
    }
  }
}

// Add the helpers above the component
invoiceViewCode = invoiceViewCode.replace('export function InvoiceView() {', `${themesObjStr}\n${formatDateFuncStr}\n\nexport function InvoiceView() {`);

// Replace the JSX
const newCode = invoiceViewCode.substring(0, oldStartIdx) + captureAreaHtml + invoiceViewCode.substring(oldEndIdx);
fs.writeFileSync('src/pages/InvoiceView.tsx', newCode);
console.log("Patched InvoiceView completely!");

