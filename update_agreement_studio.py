import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# Make sure we import Lock, Unlock
if 'Lock' not in content:
    content = content.replace("Palette, ", "Palette, Lock, Unlock, ")

# Add isContentLocked state right after the existing state definitions
content = content.replace('const [invoiceTypography, setInvoiceTypography] = useState("modern");',
"""const [invoiceTypography, setInvoiceTypography] = useState("modern");
  
  const [isContentLocked, setIsContentLocked] = useState(() => localStorage.getItem('agreementContentLocked') === 'true');
  const [isSignaturesLocked, setIsSignaturesLocked] = useState(() => localStorage.getItem('agreementSignaturesLocked') === 'true');
""")

# We need to lock provider signature
content = content.replace('const [providerSig, setProviderSig] = useState<string | null>(null);',
"""
  const initialProviderSig = localStorage.getItem('agreementProviderSig') || null;
  const [providerSig, setProviderSig] = useState<string | null>(initialProviderSig);

  useEffect(() => {
    if (isSignaturesLocked) {
      if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
      else localStorage.removeItem('agreementProviderSig');
    }
  }, [providerSig, isSignaturesLocked]);
""")

# Replace the Content Editor header to include the Lock button
content_editor_pattern = r'\{/\* Content Editor \*/\}.*?<h3.*?>.*?Project Scope & Content.*?</h3>'
content_editor_repl = """{/* Content Editor */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" /> Project Scope & Content
            </h3>
            <button
              onClick={() => {
                const newLock = !isContentLocked;
                setIsContentLocked(newLock);
                localStorage.setItem('agreementContentLocked', String(newLock));
              }}
              className={`p-1.5 border-2 border-black transition-colors ${isContentLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
              title={isContentLocked ? "Unlock Content Settings" : "Lock Content Settings (Applies to new agreements)"}
            >
              {isContentLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>"""

content = re.sub(content_editor_pattern, content_editor_repl, content, flags=re.DOTALL)

# Add Lock button for Signatures
signatures_pattern = r'\{/\* Signatures \*/\}.*?<h3.*?>.*?Signatures.*?</h3>'
signatures_repl = """{/* Signatures */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-purple-600" /> Signatures
            </h3>
            <button
              onClick={() => {
                const newLock = !isSignaturesLocked;
                setIsSignaturesLocked(newLock);
                localStorage.setItem('agreementSignaturesLocked', String(newLock));
              }}
              className={`p-1.5 border-2 border-black transition-colors ${isSignaturesLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
              title={isSignaturesLocked ? "Unlock Signatures" : "Lock Signatures (Applies to new agreements)"}
            >
              {isSignaturesLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>"""
content = re.sub(signatures_pattern, signatures_repl, content, flags=re.DOTALL)

# Increase the height of the editor to min-h-[400px] instead of min-h-[250px]
content = content.replace("min-h-[250px]", "min-h-[400px]")

# Increase the height of the editor in the left panel by making the parent flex-1
# Wait, the editor itself is inside <div className="border-2 border-black bg-white flex flex-col">
content = content.replace('<div className="border-2 border-black bg-white flex flex-col">', '<div className="border-2 border-black bg-white flex flex-col min-h-[450px]">')

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)

