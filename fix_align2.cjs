const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Use regex to match the end of the client signature block
const regex = /\{new Date\(agreement\.acceptedAt\)\.toLocaleString\(\)\}\s*<\/p>\s*)\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>/;

const match = code.match(/\{new Date\(agreement\.acceptedAt\)\.toLocaleString\(\)\}[\s\S]*?<\/p>\s*\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>/);

if (!match) {
  console.log("Regex not matched");
} else {
  const correctEnd = match[0] + `
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
  
  const splitIndex = match.index;
  const before = code.substring(0, splitIndex);
  
  // also let's strip `overflow-x-hidden w-full` from the root container
  let finalCode = before + correctEnd;
  finalCode = finalCode.replace('overflow-x-hidden w-full"', '"');
  
  fs.writeFileSync('src/pages/AgreementView.tsx', finalCode);
  console.log("File rewritten safely.");
}
