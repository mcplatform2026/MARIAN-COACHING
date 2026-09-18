import re

filepath = 'src/components/SignatureCanvasBlock.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("showSaveDefault?: boolean;", "showSaveDefault?: boolean;\n  onSaveDefault?: (signature: string) => void;")
content = content.replace("showSaveDefault = false }: SignatureCanvasBlockProps)", "showSaveDefault = false, onSaveDefault }: SignatureCanvasBlockProps)")

old_save = """            onClick={(e) => {
              e.preventDefault();
              localStorage.setItem('defaultProviderSig', finalSignature);
              alert('Signature saved as default! It will auto-load for future agreements.');
            }}"""
new_save = """            onClick={(e) => {
              e.preventDefault();
              if (onSaveDefault && finalSignature) {
                onSaveDefault(finalSignature);
              } else if (finalSignature) {
                localStorage.setItem('defaultProviderSig', finalSignature);
                alert('Signature saved as default! It will auto-load for future agreements.');
              }
            }}"""
content = content.replace(old_save, new_save)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated SignatureCanvasBlock")

