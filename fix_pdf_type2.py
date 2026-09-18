with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }", "jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
