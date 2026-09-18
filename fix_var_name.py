import re

files_to_patch = [
    'src/components/AgreementStudio.tsx',
    'src/pages/AgreementView.tsx',
    'src/pages/DocumentView.tsx',
    'src/pages/Invoices.tsx',
    'src/pages/MonthlyReport.tsx'
]

for filepath in files_to_patch:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        content = content.replace("const pageHeight = 1123;", "const pageHeightPx = 1123;")
        content = content.replace("pageForTop / pageHeight", "pageForTop / pageHeightPx")
        content = content.replace("top / pageHeight", "top / pageHeightPx")
        content = content.replace("pageHeight - 60", "pageHeightPx - 60")
        content = content.replace("pageHeight - marginY", "pageHeightPx - marginY")
        content = content.replace("pageHeight + marginY", "pageHeightPx + marginY")
        content = content.replace("totalHeight / pageHeight", "totalHeight / pageHeightPx")
        content = content.replace("pages * pageHeight", "pages * pageHeightPx")

        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error {filepath}: {e}")
        
