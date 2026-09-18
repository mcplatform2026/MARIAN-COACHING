import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Replace mailto with Gmail link
pattern = r'href=\{`mailto:\?subject=\$\{encodeURIComponent\((.*?)\)\}\&body=\$\{encodeURIComponent\((.*?)\)\}`\}'
replacement = r'href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(\1)}&body=${encodeURIComponent(\2)}`}'
content = re.sub(pattern, replacement, content)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
