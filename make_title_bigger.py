import os
import re

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    content = content.replace("text-5xl font-headline", "text-6xl font-headline")
    
    with open(fpath, 'w') as f:
        f.write(content)
print("Updated title sizes")
