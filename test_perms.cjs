const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  try { await getDoc(doc(db, 'invoices', 'test')); console.log('invoices readable'); } catch(e) { console.log('invoices not readable'); }
  try { await getDoc(doc(db, 'agreements', 'test')); console.log('agreements readable'); } catch(e) { console.log('agreements not readable'); }
  try { await getDoc(doc(db, 'shared_invoices', 'test')); console.log('shared_invoices readable'); } catch(e) { console.log('shared_invoices not readable'); }
  try { await getDoc(doc(db, 'shared_links', 'test')); console.log('shared_links readable'); } catch(e) { console.log('shared_links not readable'); }
  try { await getDoc(doc(db, 'users/test1234/invoices/test')); console.log('users/invoices readable'); } catch(e) { console.log('users/invoices not readable'); }
  try { await getDoc(doc(db, 'users/test1234/agreements/test')); console.log('users/agreements readable'); } catch(e) { console.log('users/agreements not readable'); }
  process.exit(0);
}
check();
