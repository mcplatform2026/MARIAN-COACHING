import re

filepath = 'src/components/AgreementStudio.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix Signature Configuration lock button
old_lock_btn = """            <button 
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
            >"""

new_lock_btn = """            <button 
              onClick={() => {
                const newLock = !isSignaturesLocked;
                setIsSignaturesLocked(newLock);
                localStorage.setItem('agreementSignaturesLocked', String(newLock));
                if (newLock) {
                   if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
                   if (formData.providerSignatureLabel) localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
                }
              }}
              className={`p-1.5 border-2 border-black transition-colors ${isSignaturesLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
              title={isSignaturesLocked ? "Unlock Signatures" : "Lock Signatures (Applies to new agreements)"}
            >"""
content = content.replace(old_lock_btn, new_lock_btn)

# Fix Service Provider Name input
old_sp_input = """                  <input 
                    type="text" 
                    value={formData.providerSignatureLabel || ''} 
                    onChange={(e) => setFormData({...formData, providerSignatureLabel: e.target.value})}
                    className="font-headline font-bold uppercase text-xs p-1.5 border-2 border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-white neu-shadow-sm"
                    placeholder="Service Provider Name"
                  />"""

new_sp_input = """                  <input 
                    type="text" 
                    value={formData.providerSignatureLabel || ''} 
                    onChange={(e) => setFormData({...formData, providerSignatureLabel: e.target.value})}
                    className="font-headline font-bold uppercase text-xs p-1.5 border-2 border-black focus:outline-none bg-white neu-shadow-sm w-full"
                    placeholder="Service Provider Name"
                  />"""
content = content.replace(old_sp_input, new_sp_input)

# Fix Client Name input
old_client_input = """                  <input 
                    type="text" 
                    value={formData.clientSignatureLabel || ''} 
                    onChange={(e) => setFormData({...formData, clientSignatureLabel: e.target.value})}
                    className="font-headline font-bold uppercase text-xs p-1.5 border-2 border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-white neu-shadow-sm"
                    placeholder="Client Name"
                  />"""

new_client_input = """                  <input 
                    type="text" 
                    value={formData.clientSignatureLabel || ''} 
                    onChange={(e) => setFormData({...formData, clientSignatureLabel: e.target.value})}
                    className="font-headline font-bold uppercase text-xs p-1.5 border-2 border-black focus:outline-none bg-white neu-shadow-sm w-full"
                    placeholder="Client Name"
                  />"""
content = content.replace(old_client_input, new_client_input)

# Content Lock logic update
old_state = """  const [formData, setFormData] = useState(initialData);"""
new_state = """  const [formData, setFormData] = useState(() => {
    // Check if it's a new agreement (not editing an existing one)
    const isNew = initialData.title === 'Client Agreement' && initialData.projectDetails === '<p>Project scope details here...</p>';
    if (isNew && localStorage.getItem('agreementContentLocked') === 'true') {
      const savedContent = localStorage.getItem('defaultAgreementContent');
      if (savedContent) {
        return { ...initialData, projectDetails: savedContent };
      }
    }
    return initialData;
  });"""
content = content.replace(old_state, new_state)

# Add effect for content lock
old_effect = """  useEffect(() => {
    if (isSignaturesLocked) {"""

new_effect = """  useEffect(() => {
    if (isContentLocked) {
      localStorage.setItem('defaultAgreementContent', formData.projectDetails);
    }
  }, [formData.projectDetails, isContentLocked]);

  useEffect(() => {
    if (isSignaturesLocked) {"""
content = content.replace(old_effect, new_effect)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied fixes")
