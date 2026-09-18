import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Replace handleCopyLink
handle_copy_pattern = r'const handleCopyLink = \(id: string, customDbUid\?: string\) => \{.*?alert\(\'Shareable link copied to clipboard!\'\);\n  \};'

new_handle_copy = """const handleCopyLink = (id: string, customDbUid?: string) => {
    const uidToUse = customDbUid || user?.uid;
    if (!uidToUse) return;
    
    // Find the agreement data to encode as fallback
    const agreement = agreements.find(a => a.id === id);
    let link = `${window.location.origin}/agreement/${uidToUse}/${id}`;
    
    if (agreement) {
      const dataToEncode = {
        ...agreement,
        timestamp: undefined // remove timestamp to avoid serialization issues
      };
      import('lz-string').then(LZString => {
         const encoded = LZString.default.compressToEncodedURIComponent(JSON.stringify(dataToEncode));
         link = `${link}#data=${encoded}`;
         navigator.clipboard.writeText(link);
         alert('Shareable link copied to clipboard!');
      });
      return;
    }
    
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };"""

content = re.sub(handle_copy_pattern, new_handle_copy, content, flags=re.DOTALL)

# In handleCreate, we also generate a link
handle_create_link = r'const link = `\$\{window\.location\.origin\}/agreement/\$\{user\.uid\}/\$\{docId\}`;'
new_handle_create_link = """
        const dataToEncode = {
            ...formData,
            providerSignature,
            status: 'sent',
            id: docId
        };
        const LZString = (await import('lz-string')).default;
        const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(dataToEncode));
        const link = `${window.location.origin}/agreement/${user.uid}/${docId}#data=${encoded}`;"""
        
content = content.replace(handle_create_link, new_handle_create_link)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)

