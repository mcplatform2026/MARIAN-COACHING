with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

content = content.replace("}, dbUid);", "});")
content = content.replace("handleCopyLink(newId, dbUid);", "handleCopyLink(newId.id, dbUid);")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
