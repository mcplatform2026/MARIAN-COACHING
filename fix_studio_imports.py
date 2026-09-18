import re
with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

if "import jsPDF" not in content:
    content = content.replace("import { useEditor, EditorContent } from '@tiptap/react';", "import { useEditor, EditorContent } from '@tiptap/react';\nimport jsPDF from 'jspdf';\nimport domtoimage from 'dom-to-image-more';")
    
with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)
