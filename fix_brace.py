import re

files_to_patch = [
    'src/pages/Invoices.tsx',
]

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("`invoice_${{invoiceNo || '01'}}.pdf`", "`invoice_${invoiceNo || '01'}.pdf`")
    
    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_patch:
    patch_file(f)
