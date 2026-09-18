import os
import glob

for filepath in ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix double brackets
    content = content.replace("invoice_${{invoiceNo", "invoice_${invoiceNo")
    content = content.replace("Agreement_${{agreement", "Agreement_${agreement")
    content = content.replace("Document_${{document", "Document_${document")
    content = content.replace("Report_${{report", "Report_${report")
    
    with open(filepath, 'w') as f:
        f.write(content)
