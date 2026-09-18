const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp({
  projectId: 'praanta-os'
});
const db = getFirestore();

async function run() {
  try {
    const docSnap = await db.collection('users').doc('test').get();
    console.log("Admin read success! Exists:", docSnap.exists);
  } catch (e) {
    console.log("Admin read failed:", e.message);
  }
}
run();
