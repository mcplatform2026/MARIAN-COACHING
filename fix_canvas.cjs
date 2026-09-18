const fs = require('fs');
const file = 'src/components/SignatureCanvasBlock.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/canvas\.width = 400;\s*canvas\.height = 100;/g, 'canvas.width = 600;\n    canvas.height = 150;');
content = content.replace(/ctx\.font = `40px \$\{selectedFont\}`;/g, 'ctx.font = `80px ${selectedFont}`;');
fs.writeFileSync(file, content);
console.log('Fixed SignatureCanvasBlock');
