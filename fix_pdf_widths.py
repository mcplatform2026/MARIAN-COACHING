import re

# Update AgreementStudio
with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# Instead of max-w-[210mm], let's make it fixed 210mm width so the PDF is always wide
content = content.replace('max-w-[210mm]', 'w-[210mm]')

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)

# Update AgreementView
with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace('max-w-[210mm]', 'w-[210mm]')

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
