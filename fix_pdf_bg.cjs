const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Fix theme fallback in handleDownloadPDF
  // In AgreementView: const currentTheme = themes[agreement?.theme || 'white'] || themes.white;
  // In AgreementStudio: const currentTheme = themes[invoiceTheme] || themes.white; (this one is probably fine)
  // Let's just replace agreement?.theme with agreement?.invoiceTheme globally just in case.
  code = code.replace(/agreement\?\.theme/g, "agreement?.invoiceTheme");
  
  // Fix CSS for block breaking. We removed inline-block for p and li, but we MUST add it for .audit-trail-block and .signatures-block
  // Old: .studio-tiptap p, .studio-tiptap li, .audit-trail-block, .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; }
  // New: 
  // .studio-tiptap p, .studio-tiptap li { page-break-inside: avoid !important; break-inside: avoid !important; }
  // .audit-trail-block, .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; display: inline-block !important; width: 100% !important; }
  
  code = code.replace(
    /\.studio-tiptap p, \.studio-tiptap li, \.audit-trail-block, \.signatures-block \{ page-break-inside: avoid !important; break-inside: avoid !important; \}/g,
    ".studio-tiptap p, .studio-tiptap li { page-break-inside: avoid !important; break-inside: avoid !important; }\n              .audit-trail-block, .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; display: inline-block !important; width: 100% !important; }"
  );

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
