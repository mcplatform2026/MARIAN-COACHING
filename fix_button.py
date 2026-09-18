import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("flex items-center justify-center gap-1.5\"", "flex items-center justify-center gap-1.5 whitespace-nowrap\"")

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
