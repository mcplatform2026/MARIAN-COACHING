import re

filepath = 'src/components/AgreementStudio.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix spacing in tiptap
content = content.replace(".studio-tiptap p { margin-bottom: 0.8em; line-height: 1.6; }", ".studio-tiptap p { margin-bottom: 0.5em; line-height: 1.5; }")
content = content.replace(".studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }", ".studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }")

# Add signatures-block
content = content.replace('<div className="mt-16 grid grid-cols-2 gap-8">', '<div className="mt-16 grid grid-cols-2 gap-8 signatures-block">')

with open(filepath, 'w') as f:
    f.write(content)

filepath = 'src/pages/AgreementView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(".studio-tiptap p { margin-bottom: 0.8em; line-height: 1.6; }", ".studio-tiptap p { margin-bottom: 0.5em; line-height: 1.5; }")
content = content.replace(".studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }", ".studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }")
content = content.replace('<div className="mt-16 pt-8 border-t-2"', '<div className="mt-16 pt-8 border-t-2 signatures-block"')

with open(filepath, 'w') as f:
    f.write(content)

print("Fixed signatures-block")
