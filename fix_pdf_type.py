with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("image:        { type: 'jpeg', quality: 0.98 },", "image:        { type: 'jpeg' as const, quality: 0.98 },")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
