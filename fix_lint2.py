with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("// @ts-ignore\\ndeclare module 'html2pdf.js';", "declare module 'html2pdf.js' { const html2pdf: any; export default html2pdf; }")
content = content.replace("declare module 'html2pdf.js';", "declare module 'html2pdf.js' { const html2pdf: any; export default html2pdf; }")

with open('src/types.ts', 'w') as f:
    f.write(content)
