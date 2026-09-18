import os
import re

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Overwrite the style tag for paragraphs
    new_style = """
                  .studio-tiptap p { margin-top: 0.25em !important; margin-bottom: 0.25em !important; line-height: 1.4 !important; }
                  .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-top: 0.25em !important; margin-bottom: 0.25em !important; }
                  .studio-tiptap li { margin-top: 0.1em !important; margin-bottom: 0.1em !important; }
"""
    # Find existing .studio-tiptap p and replace the surrounding lines
    content = re.sub(r'\.studio-tiptap p \{ [^\}]+\}\s*\.studio-tiptap ul \{ [^\}]+\}\s*\.studio-tiptap li \{ [^\}]+\}', new_style.strip(), content, flags=re.MULTILINE)
    
    with open(fpath, 'w') as f:
        f.write(content)
print("Updated CSS to override prose")
