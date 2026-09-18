const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// The bad prefix
const badPrefix = /<div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 md:p-8 overflow-hidden font-body text-black">\s*<div className="bg-surface-container-lowest w-full h-full md:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">\s*<div className="bg-white border-b-2 border-black p-4 flex items-center justify-between z-10 shrink-0">\s*<button onClick=\{onCancel\} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">\s*<ArrowLeft className="w-4 h-4" \/> Back to Agreements\s*<\/button>\s*<\/div>\s*<div className="flex-1 overflow-hidden p-2 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 relative">\s*\{\/\* LEFT PANEL - CONTROLS \*\/\}/s;

const goodPrefix = `<div className="flex flex-col lg:flex-row gap-6 h-full w-full">
      {/* LEFT PANEL - CONTROLS */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        <div className="flex items-center -mt-2 mb-0">
          <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agreements
          </button>
        </div>`;

content = content.replace(badPrefix, goodPrefix);

// The bad suffix - I added a bunch of closing tags: </div>\n</div>\n</div>\n</div>\n</div>\n  );\n}
const badSuffix = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/s;
const goodSuffix = `  </div>\n    </div>\n  );\n}`;
content = content.replace(badSuffix, goodSuffix);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
