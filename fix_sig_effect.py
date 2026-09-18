import re

filepath = 'src/components/SignatureCanvasBlock.tsx'

with open(filepath, 'r') as f:
    content = f.read()

if "useEffect" not in content:
    content = content.replace("useState,", "useState, useEffect,")
    content = content.replace("useState }", "useState, useEffect }")
    
if "useEffect(() => {" not in content:
    insertion = """
  useEffect(() => {
    if (initialSignature && !hasDrawn && !typedName && !uploadedImage) {
      setFinalSignature(initialSignature);
      onSignatureReady(initialSignature);
    }
  }, [initialSignature]);
"""
    content = content.replace("const [finalSignature, setFinalSignature] = useState<string | null>(initialSignature);", f"const [finalSignature, setFinalSignature] = useState<string | null>(initialSignature);\n{insertion}")

with open(filepath, 'w') as f:
    f.write(content)
