const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(/return \(\s*<div ref=\{previewContainerRef\}/, 'return (\n    <>\n    <div ref={previewContainerRef}');

const endMatch = code.match(/\s*\);\s*\}\s*$/);
if (endMatch) {
  code = code.replace(/\s*\);\s*\}\s*$/, '\n    </>\n  );\n}\n');
}

fs.writeFileSync('src/pages/AgreementView.tsx', code);
