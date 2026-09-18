const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('log_capture')) {
  code = `
// log_capture
const originalLog = console.log;
const originalError = console.error;
const logHistory = [];
window.logHistory = logHistory;

function capture(...args) {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  logHistory.push({ time: new Date().toISOString(), msg });
  if (logHistory.length > 1000) logHistory.shift();
}

console.log = function(...args) {
  capture(...args);
  return originalLog.apply(this, args);
};
console.error = function(...args) {
  capture(...args);
  return originalError.apply(this, args);
};

// Also patch setDoc to see what's happening
import * as firestore from 'firebase/firestore';
const originalSetDoc = firestore.setDoc;
firestore.setDoc = function(...args) {
  console.log("🔥 FIRESTORE setDoc:", args[0]?.path, JSON.stringify(args[1]).substring(0, 50));
  return originalSetDoc.apply(this, args);
};
const originalUpdateDoc = firestore.updateDoc;
firestore.updateDoc = function(...args) {
  console.log("🔥 FIRESTORE updateDoc:", args[0]?.path);
  return originalUpdateDoc.apply(this, args);
};
const originalAddDoc = firestore.addDoc;
firestore.addDoc = function(...args) {
  console.log("🔥 FIRESTORE addDoc:", args[0]?.path);
  return originalAddDoc.apply(this, args);
};
` + code;
  fs.writeFileSync('src/main.tsx', code);
  console.log("Injected log capture");
}
