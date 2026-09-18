const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// Replace the start of the return
content = content.replace(
  /<div className="flex flex-col lg:flex-row gap-6 h-full w-full">\s*\{\/\* LEFT PANEL - CONTROLS \*\/\}\s*<div className="w-full lg:w-\[45%\] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">\s*<div className="flex items-center -mt-2 mb-0">\s*<button onClick=\{onCancel\} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">\s*<ArrowLeft className="w-4 h-4" \/> Back to Agreements\s*<\/button>\s*<\/div>/,
  `<div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 md:p-8 overflow-hidden font-body text-black">
      <div className="bg-surface-container-lowest w-full h-full md:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-white border-b-2 border-black p-4 flex items-center justify-between z-10 shrink-0">
          <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agreements
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-2 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 relative">
          {/* LEFT PANEL - CONTROLS */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">`
);

// We need to add the two closing tags at the very bottom
content = content.replace(/<\/div>\n    <\/div>\n  \);\n\}/, '</div>\n    </div>\n    </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
