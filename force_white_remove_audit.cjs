const fs = require('fs');

const files = [
  'src/components/AgreementStudio.tsx',
  'src/pages/AgreementView.tsx',
  'src/pages/DocumentView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Force the theme to always be white everywhere.
  // In AgreementStudio:
  code = code.replace(/const currentTheme = themes\[invoiceTheme\] \|\| themes\.white;/g, 'const currentTheme = themes.white;');
  code = code.replace(/\(themes\[invoiceTheme\] \|\| themes\.white\)/g, 'themes.white');
  
  // In AgreementView / DocumentView:
  code = code.replace(/const currentTheme = themes\[agreement\?\.invoiceTheme \|\| 'white'\] \|\| themes\.white;/g, 'const currentTheme = themes.white;');
  code = code.replace(/const currentTheme = themes\[agreement\.invoiceTheme\] \|\| themes\.white;/g, 'const currentTheme = themes.white;');

  // Also replace any specific color mappings that might still be using the invoiceTheme variable
  // actually, the regexes above should cover it if we replaced it uniformly.

  // 2. Remove the Audit Trail block
  // We'll use a regex that matches the audit trail block.
  // It starts with {/* Verification Audit Trail Box and ends with )}
  // Or in DocumentView, it might not have the {accepted && (
  code = code.replace(/\{\/\*\s*Verification Audit Trail Box[\s\S]*?<\/[a-zA-Z]+>\s*\)\}/g, '');
  
  // And if it's just a div (DocumentView might have it without conditional)
  code = code.replace(/<div className="mt-12 p-4 border-2 border-dashed audit-trail-block"[\s\S]*?<\/div>/g, '');

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});
