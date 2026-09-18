const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Fix the pagebreak setting
  code = code.replace(
    /pagebreak:\s*\{\s*mode:\s*\[[^\]]+\][^}]+\}/g,
    "pagebreak: { mode: 'css', avoid: 'p, h1, h2, h3, li, .audit-trail-block, .signatures-block, .header-block' }"
  );

  // Fix the title max-w-[70%] and break-words
  // old: max-w-[70%] ml-auto text-right break-words
  // new: max-w-full ml-auto text-right
  code = code.replace(
    /max-w-\[70%\] ml-auto text-right break-words/g,
    "max-w-full ml-auto text-right"
  );
  
  // also replace any lingering break-words in the title class
  code = code.replace(
    /tracking-tight break-words max-w/g,
    "tracking-tight max-w"
  );
  
  // Fix the CSS <style> injection (remove inline-block and width 100% since they break text flow)
  // We'll replace the old injected style block entirely.
  const oldStyleRegex = /\.studio-tiptap p, \.studio-tiptap li, \.audit-trail-block, \.signatures-block \{[^}]+\}/g;
  code = code.replace(oldStyleRegex, ".studio-tiptap p, .studio-tiptap li, .audit-trail-block, .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; }");

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
