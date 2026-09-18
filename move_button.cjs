const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// The current structure at the bottom is:
//       </div> {/* pdfRef */}
//       {/* Actions */}
//       <div ...>
//          ...
//       </div>
//     </div> {/* transform wrapper */}
//     </div> {/* w/h wrapper */}
//   );
// }

const searchStr = `        </div>
        {/* Actions - Hidden from PDF */}
        <div className="mt-8 flex flex-col items-center w-full pt-6 border-t-2" style={{ borderColor: currentTheme.border }} data-html2pdf-ignore="true">
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
    </div>
  );
}`;

const replaceStr = `        </div>
      </div>
    </div>
        
    {/* Actions - Hidden from PDF */}
    <div className="mt-8 mb-16 flex flex-col items-center w-full max-w-3xl pt-6 border-t-2" style={{ borderColor: currentTheme.border }} data-html2pdf-ignore="true">
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

if (code.includes('Actions - Hidden from PDF')) {
  // Let's use regex to be safe about white spaces
  const regex = /<\/div>\s*\{\/\*\s*Actions - Hidden from PDF\s*\*\/\}\s*<div className="mt-8 flex flex-col items-center w-full pt-6 border-t-2"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;
  
  const replaceHTML = `</div>
      </div>
    </div>
    
    {/* Actions - Hidden from PDF */}
    <div className="mt-4 mb-16 flex flex-col items-center w-full max-w-3xl" data-html2pdf-ignore="true">
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

  code = code.replace(regex, replaceHTML);
  fs.writeFileSync('src/pages/AgreementView.tsx', code);
  console.log("Button moved successfully");
} else {
  console.log("Could not find Actions block");
}
