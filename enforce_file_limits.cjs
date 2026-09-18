const fs = require('fs');

function applyLimit(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Invoices.tsx
  if (filePath.includes('Invoices.tsx')) {
    content = content.replace(
      /const handleLogoUpload = \(file: File\) => \{\n    if \(file && file\.type\.startsWith\("image\/"\)\) \{/,
      `const handleLogoUpload = (file: File) => {\n    if (file && file.type.startsWith("image/")) {\n      if (file.size > 500 * 1024) { alert("Logo is too large. Please upload an image smaller than 500KB to ensure smooth saving."); return; }`
    );
    content = content.replace(
      /const handleSignatureUpload = \(file: File\) => \{\n    if \(file && file\.type\.startsWith\("image\/"\)\) \{/,
      `const handleSignatureUpload = (file: File) => {\n    if (file && file.type.startsWith("image/")) {\n      if (file.size > 500 * 1024) { alert("Signature is too large. Please upload an image smaller than 500KB."); return; }`
    );
  }

  // AgreementStudio.tsx
  if (filePath.includes('AgreementStudio.tsx')) {
    content = content.replace(
      /const handleLogoFile = \(file: File\) => \{\n    const reader = new FileReader\(\);/,
      `const handleLogoFile = (file: File) => {\n    if (file.size > 500 * 1024) { alert("Logo is too large. Please upload an image smaller than 500KB to ensure smooth saving."); return; }\n    const reader = new FileReader();`
    );
  }

  // SignatureCanvasBlock.tsx
  if (filePath.includes('SignatureCanvasBlock.tsx')) {
    content = content.replace(
      /if \(e\.target\.files && e\.target\.files\[0\]\) \{\n      const reader = new FileReader\(\);/,
      `if (e.target.files && e.target.files[0]) {\n      if (e.target.files[0].size > 500 * 1024) { alert("Signature is too large. Please upload an image smaller than 500KB."); return; }\n      const reader = new FileReader();`
    );
  }

  fs.writeFileSync(filePath, content);
}

applyLimit('src/pages/Invoices.tsx');
applyLimit('src/components/AgreementStudio.tsx');
applyLimit('src/components/SignatureCanvasBlock.tsx');
