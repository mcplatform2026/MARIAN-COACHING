const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Read firebase-applet-config.json
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const app = initializeApp(config.firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    await setDoc(doc(db, 'shared_invoices', 'test1234'), { test: true });
    console.log("SUCCESS!");
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
run();
