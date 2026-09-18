const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Add audit-trail-block class if not present
  code = code.replace(
    /className="mt-12 p-4 border-2 border-dashed"/g,
    'className="mt-12 p-4 border-2 border-dashed audit-trail-block"'
  );

  // Update pagebreak option
  // It might be currently defined as:
  // pagebreak: { mode: 'css', avoid: ['.signatures-block', '.header-block'] }
  // or maybe not defined in all files. Let's do a regex replace.
  
  if (code.includes('pagebreak: {')) {
    code = code.replace(
      /pagebreak:\s*\{\s*mode:\s*'css',\s*avoid:\s*\[[^\]]+\]\s*\}/g,
      "pagebreak: { mode: 'css', avoid: ['.signatures-block', '.header-block', '.audit-trail-block', 'p', 'h1', 'h2', 'h3', 'li'] }"
    );
  } else {
    // If it doesn't exist, we add it after jsPDF:
    code = code.replace(
      /(jsPDF:\s*\{[^}]+\}),/g,
      "$1,\n        pagebreak: { mode: 'css', avoid: ['.signatures-block', '.header-block', '.audit-trail-block', 'p', 'h1', 'h2', 'h3', 'li'] },"
    );
  }

  // Also to be safe, let's inject a CSS style globally or in the component to avoid breaks inside paragraphs
  // Find <style> tag if present, or add one.
  const styleInjection = `
                  .studio-tiptap p, .studio-tiptap li, .audit-trail-block { page-break-inside: avoid; break-inside: avoid; }`;
  if (code.includes('<style>{`')) {
    code = code.replace(/<style>\{`/g, '<style>{`' + styleInjection);
  }

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
