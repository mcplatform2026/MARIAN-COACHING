import re

filepath = 'src/components/AgreementStudio.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Update the useEffect for isSignaturesLocked
old_use_effect = """  useEffect(() => {
    if (isSignaturesLocked) {
      if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
      else localStorage.removeItem('agreementProviderSig');
    }
  }, [providerSig, isSignaturesLocked]);"""

new_use_effect = """  useEffect(() => {
    if (isSignaturesLocked) {
      if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
      else localStorage.removeItem('agreementProviderSig');
      if (formData.providerSignatureLabel) {
        localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
      }
    }
  }, [providerSig, isSignaturesLocked, formData.providerSignatureLabel]);"""

content = content.replace(old_use_effect, new_use_effect)

# Find the Signature Configuration header
old_header = """          <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2 mb-4">
            <PenTool className="w-4 h-4 text-blue-600" /> Signature Configuration
          </h3>"""

new_header = """          <div className="border-b-2 border-black pb-2 flex items-center justify-between mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" /> Signature Configuration
            </h3>
            <button 
              onClick={() => {
                const newLock = !isSignaturesLocked;
                setIsSignaturesLocked(newLock);
                localStorage.setItem('agreementSignaturesLocked', String(newLock));
                if (newLock) {
                   if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
                   if (formData.providerSignatureLabel) localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
                }
              }}
              className="text-neutral-500 hover:text-black transition-colors"
              title={isSignaturesLocked ? "Unlock Signatures" : "Lock Signatures"}
            >
              {isSignaturesLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>"""

content = content.replace(old_header, new_header)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated Signature Configuration header and lock logic")

