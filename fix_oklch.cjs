const fs = require('fs');

const files = [
  'src/pages/DocumentView.tsx',
  'src/pages/AgreementView.tsx',
  'src/components/AgreementStudio.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Physically remove ignoreElements to avoid any processing of them
  content = content.replace(
    /ignoreElements\.forEach\(el => \{\s*\(el as HTMLElement\)\.style\.display = 'none';\s*\}\);/g,
    'ignoreElements.forEach(el => el.remove());'
  );

  // 2. Replace the Check icon className in the Audit Trail
  content = content.replace(
    /<Check size=\{14\} className="text-emerald-600" \/>/g,
    '<Check size={14} color="#059669" />'
  );

  fs.writeFileSync(file, content);
});

console.log('fixed oklch elements');
