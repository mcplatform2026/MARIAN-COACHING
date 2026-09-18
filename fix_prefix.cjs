const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const bad = /return \(\s*<div className="flex flex-col lg:flex-row gap-6 h-full w-full">\s*\{\/\* LEFT PANEL - CONTROLS \*\/\}\s*<div className="flex items-center -mt-2 mb-0">\s*<button onClick=\{onCancel\} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">\s*<ArrowLeft className="w-4 h-4" \/> Back to Agreements\s*<\/button>\s*<\/div>\s*<div className="w-full lg:w-\[45%\] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">/s;

const good = `return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full">
      {/* LEFT PANEL - CONTROLS */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        <div className="flex items-center -mt-2 mb-0">
          <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-neutral-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agreements
          </button>
        </div>`;

content = content.replace(bad, good);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
