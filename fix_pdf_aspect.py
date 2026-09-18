import re

filepath = 'src/components/AgreementStudio.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix pdf height loop
content = content.replace("const pageHeight = 297;", "const pageHeight = (1123 * 210) / 794; // Exact aspect ratio to prevent floating point blank pages")

# We should also ensure heightLeft loop doesn't trigger for floating point errors
content = content.replace("while (heightLeft > 0) {", "while (heightLeft > 1) { // 1mm buffer for floating point")

with open(filepath, 'w') as f:
    f.write(content)

filepath = 'src/pages/AgreementView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("const pageHeight = 297;", "const pageHeight = (1123 * 210) / 794;")
content = content.replace("while (heightLeft > 0) {", "while (heightLeft > 1) {")

with open(filepath, 'w') as f:
    f.write(content)

print("Fixed aspect ratio in PDF")
