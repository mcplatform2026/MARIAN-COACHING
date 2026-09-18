import re

with open('src/hooks/useAgreements.ts', 'r') as f:
    content = f.read()

content = content.replace("templateType: string;", "title?: string;\n  templateType?: string;")
content = content.replace("fee: string;", "fee?: string;")

with open('src/hooks/useAgreements.ts', 'w') as f:
    f.write(content)

