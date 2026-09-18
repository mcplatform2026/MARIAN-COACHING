const fs = require('fs');

const updateDatesAndTitle = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Change toLocaleDateString() to toLocaleString() for the signature blocks
  content = content.replace(/\{new Date\(agreement\.createdAt(?: \|\| Date\.now\(\))?\)\.toLocaleDateString\(\)\}/g, '{new Date(agreement.createdAt || Date.now()).toLocaleString()}');
  content = content.replace(/\{new Date\(agreement\.acceptedAt\)\.toLocaleDateString\(\)\}/g, '{new Date(agreement.acceptedAt).toLocaleString()}');

  // Re-add SIGNATURES & EXECUTION
  // In AgreementView and DocumentView
  if (content.includes('className="mt-16 pt-8 border-t-2 signatures-block"')) {
    content = content.replace(
      /<div className="mt-16 pt-8 border-t-2 signatures-block" style=\{\{ borderColor: currentTheme\.border \}\}>\s*<div className="flex flex-row gap-12 w-full">/g,
      `<div className="mt-16 pt-8 pb-8 border-t-2 signatures-block" style={{ borderColor: currentTheme.border }}>
            <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
            <div className="flex flex-row gap-12 w-full">`
    );
  }
  
  fs.writeFileSync(file, content);
};

updateDatesAndTitle('src/pages/DocumentView.tsx');
updateDatesAndTitle('src/pages/AgreementView.tsx');

// Also update AgreementStudio for the title
let studioContent = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');
if (studioContent.includes('className="mt-16 flex flex-row gap-8 w-full signatures-block"')) {
  studioContent = studioContent.replace(
    /<div className="mt-16 flex flex-row gap-8 w-full signatures-block">/g,
    `<div className="mt-16 pt-8 border-t-2 signatures-block" style={{ borderColor: themes.white.border }}>
                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
                <div className="flex flex-row gap-8 w-full">`
  );
  // Need to add closing div because we added a wrapper, wait, let's just add the h3 directly since the wrapper is already there.
}
fs.writeFileSync('src/components/AgreementStudio.tsx', studioContent);

console.log('Fixed dates and title');
