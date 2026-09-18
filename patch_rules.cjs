const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const target = `    // Maintained for backward compatibility with your existing AuthProvider
    match /collaborators/{email} {
      // Allows the collaborator to read their own record during login
      allow get: if isSignedIn() && request.auth.token.email == email;
      // Allows the owner to query their list of collaborators
      allow list: if isSignedIn() && resource.data.ownerUid == request.auth.uid;
      
      allow write: if isSignedIn();
    }`;

const replacement = target + `
    
    // Public collection for short-link shared invoices
    match /shared_invoices/{shortId} {
      allow read: if true;
      allow write: if isSignedIn();
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('firestore.rules', code);
console.log('Patched firestore.rules');
