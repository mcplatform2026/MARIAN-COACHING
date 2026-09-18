with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

content = content.replace("import Color from '@tiptap/extension-color';", "import { Color } from '@tiptap/extension-color';")
content = content.replace("import TextStyle from '@tiptap/extension-text-style';", "import { TextStyle } from '@tiptap/extension-text-style';")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
