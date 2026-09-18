import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("// import html2pdf from 'html2pdf.js';", "import html2pdf from 'html2pdf.js';")
content = content.replace("window.print();", "await html2pdf().from(element).set(opt).save();")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
