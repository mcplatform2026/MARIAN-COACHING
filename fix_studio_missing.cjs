const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const anchor = `            <EditorContent editor={editor} className="p-4 min-h-[600px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
          </div>
        </div>`;

const replacement = `            <EditorContent editor={editor} className="p-4 min-h-[600px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
          </div>
        </div>
      </div>
      
      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className="w-full lg:w-[55%] h-full flex flex-col bg-surface-container-low border-2 border-black neu-shadow-sm overflow-hidden rounded-none relative">
        <div className="bg-neutral-900 text-white p-2 flex justify-between items-center px-4 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"><Eye className="w-3.5 h-3.5"/> Live Preview</span>
          <button onClick={handleDownloadPDF} disabled={downloading} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3 py-1 transition-colors">
            {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? 'Generating...' : 'Download PDF'}
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
`;

content = content.replace(anchor, replacement);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
