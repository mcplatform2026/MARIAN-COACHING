const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// I will replace everything from `</div>        </div>                      {/* Signatures */}` to the end of the file.
const badRegex = /<\/div>\s*<\/div>\s*\{\/\* Signatures \*\/\}.*$/s;

const rightPanel = `        </div>
      </div>
      
      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className="w-full lg:w-[55%] h-full flex flex-col bg-surface-container-low border-2 border-black neu-shadow-sm overflow-hidden rounded-none relative">
        <div className="bg-neutral-900 text-white p-2 flex justify-between items-center px-4 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"><Eye className="w-3.5 h-3.5"/> Live Preview</span>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3 py-1 transition-colors">
            {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex sm:justify-center relative" style={{ backgroundColor: themes.white.bg }}>
          <div ref={pdfRef} className="sm:mx-auto bg-white shadow-xl shrink-0" style={{ width: '794px', minHeight: '1123px', position: 'relative' }}>
            <div className="p-8 sm:p-12 md:p-[20mm]">
              <div className="header-block flex justify-between items-start mb-8">
                <div>
                  {logoImage ? (
                    <div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>
                      <img src={logoImage} alt="Brand Custom Logo" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="font-headline font-black text-2xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      LOREM IPSUM.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right" style={{ fontFamily: 'var(--font-headline-family)', color: themes.white.text }}>
                    {formData.title || 'Agreement'}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">Prepared for {formData.clientName || 'Client'}</p>
                  {formData.clientEmail && <p className="text-sm mt-1 opacity-80">{formData.clientEmail}</p>}
                  <p className="text-xs opacity-70 mt-1">{new Date().toLocaleString()}</p>
                  {formData.fee && <p className="text-sm mt-2 font-bold uppercase tracking-wider opacity-90">Total Fee: {formData.fee}</p>}
                </div>
              </div>

              <div className="prose prose-sm sm:prose-base max-w-none">
                <style>{\`
                  .studio-tiptap { display: block; }
                  .studio-tiptap p, .studio-tiptap li { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.25em 0 !important;
                  }
                  .signatures-block, .header-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: flex !important;
                  }
                  .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap h3 { 
                    page-break-after: avoid !important; 
                    break-after: avoid !important; 
                    page-break-inside: avoid !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.5em 0 !important;
                  }
                  .studio-tiptap h1 { font-family: var(--font-headline-family); font-size: 1.8em; font-weight: 900; text-transform: uppercase; color: \${themes.white.text}; }
                  .studio-tiptap h2 { font-family: var(--font-headline-family); font-size: 1.5em; font-weight: 800; text-transform: uppercase; color: \${themes.white.text}; }
                  .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0 !important; padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
                \`}</style>
                <div className="studio-tiptap" dangerouslySetInnerHTML={{ __html: formData.projectDetails || '<p className="italic opacity-50">Content will appear here...</p>' }} />
              </div>
              
              {/* Signatures */}
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
}`;

content = content.replace(badRegex, rightPanel);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
