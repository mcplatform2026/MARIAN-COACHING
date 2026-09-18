const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
  projectId: 'praanta-os'
});

const db = getFirestore();
db.collection('users').limit(1).get().then(snap => {
  console.log("Success! Docs:", snap.size);
}).catch(e => {
  console.error("Failed:", e.message);
});
