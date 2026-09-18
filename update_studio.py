import re

filepath = 'src/components/AgreementStudio.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Update useState for providerSig
content = content.replace("const [providerSig, setProviderSig] = useState<string | null>(null);", "const [providerSig, setProviderSig] = useState<string | null>(() => localStorage.getItem('defaultProviderSig'));")

# Add showSaveDefault to SignatureCanvasBlock
content = content.replace('<SignatureCanvasBlock onSignatureReady={setProviderSig} label={formData.providerSignatureLabel || "Service Provider Name"} />', '<SignatureCanvasBlock onSignatureReady={setProviderSig} label={formData.providerSignatureLabel || "Service Provider Name"} initialSignature={providerSig} showSaveDefault={true} />')

with open(filepath, 'w') as f:
    f.write(content)
print("Patched AgreementStudio")
