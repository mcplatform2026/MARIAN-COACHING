import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("{loading ? 'Signing...' : 'I Agree & Sign'}", "{loading ? 'Signing...' : 'Sign & Finalize'}")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
