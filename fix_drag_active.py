import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# I removed dragActive when I removed logoImage!
# Let's add it back.

insert_str = """
  const [dragActive, setDragActive] = useState(false);
"""

# Let's add it right after logoImage
content = content.replace("const [logoImage, setLogoImage] = useState<string | null>(() => localStorage.getItem('agreementLogo') || null);", 
                          "const [logoImage, setLogoImage] = useState<string | null>(() => localStorage.getItem('agreementLogo') || null);\n  const [dragActive, setDragActive] = useState(false);")

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)
