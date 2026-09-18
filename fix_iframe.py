import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

old_iframe = r'<iframe \s*src={`\$\{window\.location\.origin\}/agreement/\$\{user\?\.uid\}/\$\{previewId\}`}\s*className="w-full h-full border-none absolute inset-0"\s*title="Agreement Preview"\s*/>'

new_iframe = """<iframe 
                src={previewId ? `/agreement/${user?.uid}/${previewId}#data=${btoa(encodeURIComponent(JSON.stringify(agreements.find(a => a.id === previewId) || {})))}` : ''} 
                className="w-full h-full border-none absolute inset-0 bg-white"
                title="Agreement Preview"
              />"""

content = re.sub(old_iframe, new_iframe, content)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
