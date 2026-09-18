const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /allow update: if true; \/\/ to allow updating status to viewed\/accepted/,
  `allow update: if isOwner(userId) || isCollaborator(userId) || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'viewedAt', 'acceptedAt', 'clientSignature']));`
);

fs.writeFileSync('firestore.rules', rules);
