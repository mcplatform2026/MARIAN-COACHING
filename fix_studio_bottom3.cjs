const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// I will append lots of </div> tags until the compiler stops complaining
// No, that's not good. Let's see the open tags before signatures-block:
//     return (
//    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 md:p-8 overflow-hidden font-body">
//      <div className="bg-surface-container-lowest w-full h-full md:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
//        {/* Top Header */} (closed)
//        <div className="flex-1 overflow-hidden p-2 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 relative">
//          {/* LEFT PANEL */} (closed)
//          {/* RIGHT PANEL - LIVE PREVIEW */}
//          <div className="w-full lg:w-[55%] h-full flex flex-col bg-surface-container-low border-2 border-black neu-shadow-sm overflow-hidden rounded-none relative">
//            {/* Toolbar */} (closed)
//            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex sm:justify-center relative" style={{ backgroundColor: themes.white.bg }}>
//              <div ref={pdfRef} className="sm:mx-auto bg-white shadow-xl shrink-0" style={{ width: '794px', minHeight: '1123px', position: 'relative' }}>
//                <div className="p-8 sm:p-12 md:p-[20mm]">
//                  <div className="header-block"> ... </div>
//                  <div className="prose prose-sm sm:prose-base max-w-none">
//                    ...
//                  </div>
//                  <div className="html2pdf__page-break"></div>
//                  <div className="mt-16 pt-8 border-t-2 signatures-block flex-col"> ... </div>
//
// So open tags from `pdfRef` down:
// 1. <div ref={pdfRef}>
// 2.   <div className="p-8 sm:p-12 md:p-[20mm]">
// 3.     ... (headers)
// 4.     <div className="prose">
// 5.       ... 
//        </div> (prose closed)
// 6.     <div className="html2pdf__page-break"></div>
// 7.     <div className="mt-16 pt-8 ..."> (signatures-block)
// 8.       <div className="flex flex-row ...">
// 9.         <div className="flex-1 ..."> (provider signature)
//            </div>
// 10.        <div className="flex-1 ..."> (client signature)
//            </div>
//          </div> (closes flex row)
//        </div> (closes signatures-block)
//      </div> (closes p-8 sm:p-12)
//    </div> (closes pdfRef)
//  </div> (closes flex-1 overflow-y-auto)
// </div> (closes RIGHT PANEL)
// </div> (closes flex-1 overflow-hidden)
// </div> (closes bg-surface-container-lowest)
// </div> (closes fixed inset-0)

content = content.replace(/\{\/\* Signatures \*\/\}.*$/s, `              {/* Signatures */}
              <div className="html2pdf__page-break"></div>
              <div className="mt-16 pt-8 border-t-2 signatures-block flex flex-col" style={{ borderColor: themes.white.border }}>
                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
                <div className="flex flex-row gap-8 w-full">
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2" style={{ borderColor: themes.white.border }}>
                    <p className="font-headline font-bold uppercase tracking-wide text-xs text-center opacity-60 mb-4" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      {formData.providerSignatureLabel || 'Service Provider Name'}
                    </p>
                    {providerSig ? (
                      <img src={providerSig} alt="Provider Signature" className="h-16 mix-blend-multiply" />
                    ) : (
                      <div className="h-16 flex items-center justify-center opacity-40 font-italic text-sm">Not signed yet</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2" style={{ borderColor: themes.white.border }}>
                    <p className="font-headline font-bold uppercase tracking-wide text-xs text-center opacity-60 mb-4" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      Client Signature
                    </p>
                    {clientSig ? (
                      <img src={clientSig} alt="Client Signature" className="h-16 mix-blend-multiply" />
                    ) : (
                      <div className="h-16 flex items-center justify-center opacity-40 font-italic text-sm">To be signed by client</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}`);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
