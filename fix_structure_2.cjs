const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
let beforeActions = code.substring(0, actionsStart);

// Remove ANY `<>` at the start of return
beforeActions = beforeActions.replace(/return \(\s*<>\s*/, 'return (\n    ');

// Strip all trailing </div> and whitespace
const cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');

const opened = (cleanBefore.match(/<div/g) || []).length;
const closed = (cleanBefore.match(/<\/div>/g) || []).length;
const stillOpen = opened - closed; 
const divsToClose = stillOpen - 1; // leave previewContainerRef open

let newCode = cleanBefore + '\n';
for(let i=0; i<divsToClose; i++) {
  newCode += '      </div>\n';
}

newCode += '      \n      {/* Actions - Hidden from PDF */}\n';
newCode += `      <div className="mt-8 mb-16 flex flex-col items-center w-full max-w-3xl" data-html2pdf-ignore="true">
        {!accepted ? (
          <button 
            onClick={handleAgree}
            className="px-8 py-4 bg-primary-container text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none"
          >
            I Agree & Accept
          </button>
        ) : (
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-8 py-4 bg-neutral-900 text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={18} /> {downloading ? 'Rendering...' : 'Download PDF Copy'}
          </button>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/pages/AgreementView.tsx', newCode);
console.log("Rewritten correctly! stillOpen:", stillOpen);
