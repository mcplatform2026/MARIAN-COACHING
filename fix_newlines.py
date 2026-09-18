with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()
    
content = content.replace("coaching: { title: 'Coaching Agreement', details: '1. 4x monthly 60-min sessions.\n2. Email support between sessions.\n3. 3-month commitment required.' }", "coaching: { title: 'Coaching Agreement', details: '1. 4x monthly 60-min sessions.\\n2. Email support between sessions.\\n3. 3-month commitment required.' }")
content = content.replace("consulting: { title: 'Consulting Agreement', details: '1. Discovery phase.\n2. Strategy development.\n3. Implementation support.' }", "consulting: { title: 'Consulting Agreement', details: '1. Discovery phase.\\n2. Strategy development.\\n3. Implementation support.' }")
content = content.replace("retainer: { title: 'Retainer Agreement', details: '1. Up to 20 hours per month.\n2. Priority response.\n3. Monthly strategy call.' }", "retainer: { title: 'Retainer Agreement', details: '1. Up to 20 hours per month.\\n2. Priority response.\\n3. Monthly strategy call.' }")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
