import os

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    # We replaced text-5xl with text-6xl earlier, let's change it to text-4xl and add some max-width and wrapping
    content = content.replace('text-6xl font-headline font-black uppercase tracking-tight', 'text-4xl font-headline font-black uppercase tracking-tight break-words max-w-sm ml-auto')
    
    with open(fpath, 'w') as f:
        f.write(content)
print("Updated title sizes")
