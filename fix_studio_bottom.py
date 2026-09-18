import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# Fix Branding & Theme lock
pattern_branding = re.compile(r'<h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">\s*<Palette className="w-4 h-4 text-blue-600" /> Branding & Theme\s*</h3>', re.DOTALL)

replacement_branding = """<div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" /> Branding & Theme
            </h3>
            <button
              onClick={() => setIsThemeLocked(!isThemeLocked)}
              className={`flex items-center gap-1.5 px-2 py-1 border-2 text-[10px] uppercase font-bold tracking-wider transition-all ${
                isThemeLocked ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-neutral-300 text-neutral-500 hover:border-black hover:text-black'
              }`}
              title={isThemeLocked ? "Settings locked for future agreements" : "Lock settings for future agreements"}
            >
              {isThemeLocked ? <Lock size={12} /> : <Unlock size={12} />}
              {isThemeLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>"""

content = re.sub(pattern_branding, replacement_branding, content)


# Fix Action Buttons at bottom
pattern_actions = re.compile(r'{/\* Action Buttons \*/}\s*<div className="flex flex-col sm:flex-row gap-2 mt-2 pb-10">\s*<button onClick=\{\(e\) => handleSubmit\(e, true\)\}.*?</button>\s*<button onClick=\{\(e\) => handleSubmit\(e, false\)\}.*?</button>\s*</div>', re.DOTALL)

replacement_actions = """{/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2 pb-10">
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full py-3 border-2 border-black bg-white text-black font-headline font-bold text-xs uppercase hover:bg-neutral-100 transition-colors neu-shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Preparing PDF...' : 'Download Agreement PDF'}
          </button>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={(e) => handleSubmit(e, true)} className="flex-1 py-3 border-2 border-black bg-neutral-100 text-black font-headline font-bold text-xs uppercase hover:bg-neutral-200 transition-colors neu-shadow-sm">
              Save as Draft
            </button>
            <button onClick={(e) => handleSubmit(e, false)} className="flex-1 py-3 border-2 border-black bg-primary-container text-white font-headline font-bold text-xs uppercase hover:bg-primary-container/90 transition-colors neu-shadow-sm flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Finalize & Get Link
            </button>
          </div>
        </div>"""

content = re.sub(pattern_actions, replacement_actions, content)

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)
