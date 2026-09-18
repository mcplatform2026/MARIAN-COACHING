import re

# Invoices uses `import { jsPDF } from "jspdf"`
# AgreementView uses `import jsPDF from 'jspdf'`

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace("import jsPDF from 'jspdf';", 'import { jsPDF } from "jspdf";')

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import jsPDF from 'jspdf';", 'import { jsPDF } from "jspdf";')

# also update new jsPDF('p', 'mm', 'a4') to new jsPDF({ ... }) in AgreementView
content = content.replace("const pdf = new jsPDF('p', 'mm', 'a4');", """const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });""")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)

