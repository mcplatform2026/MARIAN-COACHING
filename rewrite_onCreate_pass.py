import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Make sure we actually pass the activeAgreement if it's not new.
# The previous rewrite failed to properly update the initialData attribute, it looks like it was overridden or skipped.
# Let's check what it is right now.

content = content.replace("initialData={{ title: 'Client Agreement', clientName: '', clientEmail: '', projectDetails: templates.coaching.details }}",
"""initialData={activeAgreement === 'new' ? {
            clientName: '',
            clientEmail: '',
            title: 'Client Agreement',
            projectDetails: '<p>Project scope details here...</p>',
            fee: ''
          } : activeAgreement}""")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
