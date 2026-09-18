import re
import os

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    content = content.replace("'.studio-tiptap p, .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap ul, .signatures-block, .header-block, .invoice-row, .invoice-header, .invoice-totals, .report-block'", "'.studio-tiptap p, .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap ul, .studio-tiptap blockquote, .studio-tiptap img, .studio-tiptap table, .signatures-block, .header-block, .invoice-row, .invoice-header, .invoice-totals, .report-block'")
    
    # Also change padding 60px 60px to 80px 80px
    content = content.replace('clone.style.padding = "60px 60px";', 'clone.style.padding = "80px 80px";')
    
    with open(fpath, 'w') as f:
        f.write(content)
print("Updated selector and padding")
