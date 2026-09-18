const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const anchor = `<div className="bg-neutral-900 text-white p-2 flex justify-between items-center px-4 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"><Eye className="w-3.5 h-3.5"/> Live Preview</span>
          <button onClick={handleDownloadPDF} disabled={downloading} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3 py-1 transition-colors">
            {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>`;

const replacement = `<div className="bg-white border-b-2 border-black p-3 flex justify-between items-center px-4 shrink-0 relative">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 border border-black/20"></div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Live Preview</span>
          </div>
        </div>`;

content = content.replace(anchor, replacement);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
