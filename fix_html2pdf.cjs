const fs = require('fs');

const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/components/AgreementStudio.tsx') {
    content = content.replace(/\`Agreement_\$\{agreement\?\.clientName \|\| 'Document'\}\.pdf\`/g, "\`Agreement_${formData?.clientName || 'Document'}.pdf\`");
    content = content.replace(/backgroundColor: currentTheme\?\.bg \|\| '#ffffff'/g, "backgroundColor: (themes[invoiceTheme] || themes.white)?.bg || '#ffffff'");
  }
  
  content = content.replace(/margin:\s+\[20, 0, 20, 0\]/g, "margin: [20, 0] as [number, number]");
  
  fs.writeFileSync(file, content);
});

console.log('fixed html2pdf types');
