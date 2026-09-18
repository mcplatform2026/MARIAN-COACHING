import os

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    content = content.replace('max-w-sm ml-auto', 'max-w-[70%] ml-auto text-right break-words')
    
    with open(fpath, 'w') as f:
        f.write(content)
print("Updated max-width for title")
