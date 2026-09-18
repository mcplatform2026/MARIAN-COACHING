const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Revert items-center to items-start on the main container
  code = code.replace(/className="flex justify-between items-center mb-8 header-block"/g, 'className="flex justify-between items-start mb-8 header-block"');
  
  // Wrap the logo/brand color in a container with a slight top margin so it aligns optically with the H1 text cap height
  // Currently it looks like:
  // <div>
  //   {logoImage ? (
  //     <div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>
  //       <img src={logoImage} alt="Brand Custom Logo" style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain' }} />
  //     </div>
  //   ) : ...
  // </div>
  // 
  // Let's modify that first `<div>` child inside the header-block to `<div className="pt-2">`
  
  // We can target the exact structure:
  // <div className="flex justify-between items-start mb-8 header-block">
  //   <div>
  //     {logoImage ? (
  
  code = code.replace(
    /<div className="flex justify-between items-start mb-8 header-block">\s*<div>\s*\{(logoImage|agreement\.logoImage) \?/g, 
    (match) => match.replace('<div>', '<div className="pt-1.5">')
  );

  // Let's also reduce the logo maxHeight to 48px to better match the text-4xl size, preventing it from looking huge
  code = code.replace(/maxHeight: '64px'/g, "maxHeight: '48px'");
  
  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
