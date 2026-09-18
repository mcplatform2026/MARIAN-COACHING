const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

// Insert getEmailLink helper
if (!code.includes('const getEmailLink')) {
  code = code.replace('export function Agreements() {', 'export function Agreements() {\n  const getEmailLink = (subject: string, body: string) => {\n    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);\n    if (isMobile) {\n      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n    }\n    return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n  };\n');
}

// Update Email link href
// The existing href is:
// href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(agreement.title || 'Agreement')}&body=${encodeURIComponent(\`Here is the link to the agreement: \${window.location.origin}/agreement/\${user?.uid}/\${agreement.id}\`)}`}

// We'll replace it with the new function call using regex or precise string replacement.

const oldHref = 'href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(agreement.title || \\\'Agreement\\\')}&body=${encodeURIComponent(\\`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}\\`)}`}';

// Wait, doing this via string replacement with all the backticks is tricky. Let's use regex.
code = code.replace(/href=\{`https:\/\/mail\.google\.com\/mail\/\?view=cm&fs=1&tf=1&su=\$\{encodeURIComponent\(([^}]+)\)\}&body=\$\{encodeURIComponent\(([^}]+)\)\}`\}/g, 
  'href={getEmailLink($1, $2)}'
);

fs.writeFileSync('src/pages/Agreements.tsx', code);
console.log('Patched Agreements.tsx');
