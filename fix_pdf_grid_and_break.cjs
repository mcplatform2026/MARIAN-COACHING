const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Fix pagebreak config in JS
  // It's currently: pagebreak: { mode: ['css', 'legacy'] }
  // Let's replace it entirely.
  code = code.replace(/pagebreak:\s*\{\s*mode:\s*\[[^\]]+\]\s*\}/g, "pagebreak: { mode: ['css', 'legacy'], avoid: ['p', 'li', 'h1', 'h2', 'h3', '.signatures-block', '.header-block', 'img'] }");

  // 2. Fix CSS Grid in html2canvas (Change grid to flex for signatures)
  // Search for: <div className="grid grid-cols-2 gap-12">
  // Or in AgreementStudio: <div className="mt-16 grid grid-cols-2 gap-8 signatures-block">
  
  // Replace in AgreementStudio
  code = code.replace(/className="mt-16 grid grid-cols-2 gap-8 signatures-block"/g, 'className="mt-16 flex flex-row gap-8 w-full signatures-block"');
  
  // Replace in AgreementView and DocumentView
  code = code.replace(/className="grid grid-cols-2 gap-12"/g, 'className="flex flex-row gap-12 w-full"');
  code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-12">/g, '<div className="flex flex-row gap-12 w-full">'); // just in case
  code = code.replace(/<div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 signatures-block">/g, '<div className="mt-16 flex flex-row gap-8 w-full signatures-block">');

  // Now we must ensure the children of the flex container take 50% width
  // In AgreementStudio:
  // <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed"
  code = code.replace(/<div className="flex flex-col items-center justify-center p-6 border-2 border-dashed"/g, '<div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2"');

  // In AgreementView/DocumentView:
  // <div className="text-center">
  code = code.replace(/<div className="text-center">/g, '<div className="flex-1 text-center w-1/2">');
  // wait, what if there are other text-centers? Let's be more specific.
  
  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});

