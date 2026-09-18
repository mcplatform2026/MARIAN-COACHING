const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const anchor = 'new Date(agreement.acceptedAt).toLocaleString()';
let anchorIndex = code.indexOf(anchor);

const endOfClientSignature = code.indexOf('</div>', anchorIndex) + 6;
const endOfSignaturesBlock = code.indexOf('</div>', endOfClientSignature) + 6;
const endOfInnerBlock = code.indexOf('</div>', endOfSignaturesBlock) + 6;

const splitIndex = endOfInnerBlock;
const before = code.substring(0, splitIndex);

const correctEnd = `
        </div>
      </div>
    </div>
      
    {/* Actions - Hidden from PDF */}
    <div className="mt-8 mb-16 flex flex-col items-center justify-center w-full max-w-3xl" data-html2pdf-ignore="true">
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
  
let finalCode = before + correctEnd;
finalCode = finalCode.replace('overflow-x-hidden w-full"', '"');

fs.writeFileSync('src/pages/AgreementView.tsx', finalCode);
console.log("File rewritten safely.");
