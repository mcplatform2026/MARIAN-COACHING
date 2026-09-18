const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const anchor = `<div className="text-right">
                  <h1 className="text-4xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right" style={{ fontFamily: 'var(--font-headline-family)', color: themes.white.text }}>
                    {formData.title || 'Agreement'}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">Prepared for {formData.clientName || 'Client'}</p>
                  {formData.clientEmail && <p className="text-sm mt-1 opacity-80">{formData.clientEmail}</p>}
                  <p className="text-xs opacity-70 mt-1">{new Date().toLocaleString()}</p>
                  {formData.fee && <p className="text-sm mt-2 font-bold uppercase tracking-wider opacity-90">Total Fee: {formData.fee}</p>}
                </div>`;

const replacement = `<div className="text-right">
                  <h1 className="text-3xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right mb-1" style={{ fontFamily: 'var(--font-headline-family)', color: themes.white.text }}>
                    {formData.title || 'CLIENT AGREEMENT'}
                  </h1>
                  <p className="text-xs opacity-80 font-medium">Prepared for {formData.clientName || 'Client'}</p>
                  <p className="text-xs opacity-60 mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>`;

content = content.replace(anchor, replacement);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
