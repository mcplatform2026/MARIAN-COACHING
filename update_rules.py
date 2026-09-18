import re

with open('firestore.rules', 'r') as f:
    content = f.read()

rule_to_add = """      // Public access to agreements for clients to view and accept
      match /agreements/{agreementId} {
        allow read: if true;
        allow update: if true; // to allow updating status to viewed/accepted
        allow write: if isOwner(userId) || isCollaborator(userId);
      }
"""

if "match /agreements/{agreementId}" not in content:
    content = content.replace("match /{allSubcollections=**} {", rule_to_add + "\n      match /{allSubcollections=**} {")

with open('firestore.rules', 'w') as f:
    f.write(content)
