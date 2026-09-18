const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Fix Signatures Side-by-Side (Remove 'md:' so it applies universally even in narrow iframes)
  code = code.replace(/className="grid grid-cols-1 md:grid-cols-2 gap-12"/g, 'className="grid grid-cols-2 gap-12"');
  code = code.replace(/className="grid grid-cols-1 md:grid-cols-2 gap-8/g, 'className="grid grid-cols-2 gap-8');

  // 2. Fix the html2pdf pagebreak config
  code = code.replace(/pagebreak:\s*\{\s*mode:[^\}]+\}/g, "pagebreak: { mode: ['css', 'legacy'] }");

  // 3. Fix the injected CSS: Convert margin to padding to fix html2pdf bounding box calculations
  // We'll replace the existing style block entirely.
  const styleRegex = /<style>\{\`[\s\S]*?`\}<\/style>/g;
  
  const newStyle = `<style>{\`
                  .studio-tiptap { display: block; }
                  .studio-tiptap p, .studio-tiptap li { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.75em 0 !important;
                  }
                  .signatures-block, .header-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: block !important;
                  }
                  .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap h3 { 
                    page-break-after: avoid !important; 
                    break-after: avoid !important; 
                    page-break-inside: avoid !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.5em 0 !important;
                  }
                  .studio-tiptap h1 { font-family: var(--font-headline-family); font-size: 1.8em; font-weight: 900; text-transform: uppercase; color: \${currentTheme.text}; }
                  .studio-tiptap h2 { font-family: var(--font-headline-family); font-size: 1.5em; font-weight: 800; text-transform: uppercase; color: \${currentTheme.text}; }
                  .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0 !important; padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
                \`}</style>`;
                
  code = code.replace(styleRegex, newStyle);

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
