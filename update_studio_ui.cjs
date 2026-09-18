const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// 1. Update elegant font
content = content.replace(
  '{ id: "elegant", name: "Elegant (Plus Jakarta Sans)", primary: "\'Plus Jakarta Sans\', sans-serif", secondary: "\'Plus Jakarta Sans\', sans-serif" }',
  '{ id: "elegant", name: "Elegant (Archivo)", primary: "\'Archivo\', sans-serif", secondary: "\'Archivo\', sans-serif" }'
);

// 2. Fix the header
content = content.replace(
  /<div className="flex items-center -mt-2 mb-0">[\s\S]*?<\/button>\s*<\/div>/,
  `<div className="flex items-center justify-between bg-white border-2 border-black p-4 neu-shadow-sm rounded-none mb-0">
          <h2 className="font-headline font-black text-lg uppercase tracking-wider">Agreement Studio</h2>
          <button onClick={onCancel} className="flex items-center justify-center p-1.5 border-2 border-black hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>`
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
