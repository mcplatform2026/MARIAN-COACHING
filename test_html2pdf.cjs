const fs = require('fs');

const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // import html2pdf
  if (!content.includes('import html2pdf')) {
    content = content.replace(/import html2canvas from ["']html2canvas-pro["'];/g, 'import html2canvas from "html2canvas-pro";\nimport html2pdf from "html2pdf.js";');
  }

  // replace the manual jsPDF logic
  content = content.replace(/const canvas = await html2canvas\([\s\S]*?pdf\.save\(filename\);/m, 
    `// Using html2pdf for proper margins and page breaks
      const opt = {
        margin:       [20, 0, 20, 0], // top, left, bottom, right in mm
        filename:     \`Agreement_\${agreement?.clientName || 'Document'}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: currentTheme?.bg || '#ffffff', windowWidth: 794, width: 794 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      
      await html2pdf().from(clone).set(opt).save();`);
      
  fs.writeFileSync(file, content);
});

console.log('patched to html2pdf');
