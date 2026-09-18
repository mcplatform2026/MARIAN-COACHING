import re

filepath = 'src/components/AgreementStudio.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Make sure we load the name from localStorage too
# Find `initialData = { ... }` or similar. Wait, formData is initialized from initialData.
# We can just initialize providerSignatureLabel if it's empty, or add a useEffect to load it once.

insertion = """
  useEffect(() => {
    const savedName = localStorage.getItem('defaultProviderName');
    if (savedName && (!formData.providerSignatureLabel || formData.providerSignatureLabel === 'Service Provider Name')) {
      setFormData(prev => ({ ...prev, providerSignatureLabel: savedName }));
    }
  }, []);

  const handleSaveDefaultSignature = (signature: string) => {
    localStorage.setItem('defaultProviderSig', signature);
    if (formData.providerSignatureLabel) {
      localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
    }
    alert('Name and Signature saved as default! They will auto-load for future agreements.');
  };
"""

# Insert right after `useEffect(() => { if (isSignaturesLocked) ...`
content = re.sub(r'(  \}, \[providerSig, isSignaturesLocked\]\);)', r'\1\n' + insertion, content)

# update SignatureCanvasBlock usage
content = content.replace('<SignatureCanvasBlock onSignatureReady={setProviderSig} label={formData.providerSignatureLabel || "Service Provider Name"} initialSignature={providerSig} showSaveDefault={true} />', '<SignatureCanvasBlock onSignatureReady={setProviderSig} label={formData.providerSignatureLabel || "Service Provider Name"} initialSignature={providerSig} showSaveDefault={true} onSaveDefault={handleSaveDefaultSignature} />')

with open(filepath, 'w') as f:
    f.write(content)
print("Updated AgreementStudio")

