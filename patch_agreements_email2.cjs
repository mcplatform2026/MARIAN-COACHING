const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

const targetHref = 'href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(agreement.title || \\\'Agreement\\\')}&body=${encodeURIComponent(\\`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}\\`)}`}';

const replacementHref = 'href={getEmailLink(agreement.title || "Agreement", `Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}`)}';

// More robust replacement
const oldStr = 'href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(agreement.title || \\\'Agreement\\\')}&body=${encodeURIComponent(\\`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}\\`)}`}'

code = code.split('href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(agreement.title || \'Agreement\')}&body=${encodeURIComponent(`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}`)}`}').join(replacementHref);

fs.writeFileSync('src/pages/Agreements.tsx', code);
console.log('Patched Agreements.tsx');
