const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

async function check() {
  try {
    const cred = await signInAnonymously(auth);
    console.log('Anon signed in with uid:', cred.user.uid);
    try { await getDoc(doc(db, 'users/test1234/agreements/test')); console.log('agreements readable'); } catch(e) { console.log('agreements ERROR:', e.code); }
  } catch (e) {
    console.log('Auth error:', e.message);
  }
  process.exit(0);
}
check();
