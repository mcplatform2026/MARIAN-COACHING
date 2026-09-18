const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// Replace imports
content = content.replace(/Save, RefreshCw, X, Download, PenTool/g, 'Save, RefreshCw, X, Download, PenTool, ArrowLeft');

// Replace header
content = content.replace(
  /<div className="flex justify-between items-center bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">\s*<h2 className="font-headline font-black text-xl uppercase tracking-wider">Agreement Studio<\/h2>\s*<button onClick=\{onCancel\} className="p-2 border-2 border-black hover:bg-neutral-100 transition-colors">\s*<X className="w-5 h-5" \/>\s*<\/button>\s*<\/div>/g,
  `<div className="flex items-center -mt-2 mb-0">
          <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agreements
          </button>
        </div>`
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
console.log('Fixed header');
