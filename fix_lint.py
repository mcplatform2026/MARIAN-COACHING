with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("declare module 'html2pdf.js';", "// @ts-ignore\\ndeclare module 'html2pdf.js';")

with open('src/types.ts', 'w') as f:
    f.write(content)
