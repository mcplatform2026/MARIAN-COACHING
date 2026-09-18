const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const returnMatch = content.match(/return \(\s*(<style>[\s\S]*?<\/style>\s*<style>[\s\S]*?<\/style>\s*<div[\s\S]*?className="min-h-screen)/);
if (returnMatch) {
  content = content.replace(returnMatch[1],
`<>
      <style>{\`
  .pdf-clone .pdf-flex-row { flex-direction: row !important; }
  .pdf-clone .pdf-items-end { align-items: flex-end !important; }
  .pdf-clone .pdf-w-half { width: 50% !important; }
  .pdf-clone .pdf-pr-4 { padding-right: 1rem !important; }
  .pdf-clone .pdf-pl-4 { padding-left: 1rem !important; }
  .pdf-clone .pdf-text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; text-align: right !important; }
\`}</style>
      <div className="min-h-screen`);

  // add closing fragment at the end of return
  const closingMatch = content.match(/<\/div>\s*\);\s*\}/);
  if (closingMatch) {
    content = content.replace(closingMatch[0], '</div>\n    </>\n  );\n}');
  }
}

fs.writeFileSync('src/pages/AgreementView.tsx', content);
