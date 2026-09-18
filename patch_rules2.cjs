const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const target = `      match /agreements/{agreementId} {
        allow read: if true;`;

const replacement = `      match /invoices/{invoiceId} {
        allow read: if true;
      }
      match /agreements/{agreementId} {
        allow read: if true;`;

if (!code.includes('/invoices/{invoiceId}')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('firestore.rules', code);
  console.log('Patched firestore.rules');
}
