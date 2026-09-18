const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// I will just replace the whole signatures block down to the end of the file.
const regex = /\{\/\* Signatures \*\/\}.*?\};\s*\}/s;

content = content.replace(/\{\/\* Signatures \*\/\}.*$/, 
`              {/* Signatures */}
              <div className="html2pdf__page-break"></div>
              <div className="mt-16 pt-8 border-t-2 signatures-block flex-col" style={{ borderColor: themes.white.border }}>
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
  );
}
`);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
