const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  try { await getDoc(doc(db, 'users/test1234/agreements/test')); console.log('agreements readable'); } catch(e) { console.log('agreements ERROR:', e.code); }
  try { await getDoc(doc(db, 'users/test1234/invoices/test')); console.log('invoices readable'); } catch(e) { console.log('invoices ERROR:', e.code); }
  process.exit(0);
}
check();
