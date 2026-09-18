const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// replace text-blue-600 with the brandColor pattern
content = content.replace(/text-blue-600/g, 'text-black');

// fix active border for font selector
// The screenshot shows the selected font (Modern) has a thick black border and white text on black background?
// Wait, in the screenshot, "Technical (Sora)" is highlighted in BLACK background with WHITE text.
// My code does this: `invoiceTypography === font.id ? 'border-black bg-neutral-900 text-white shadow-sm' : ...`
// This matches perfectly.

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
