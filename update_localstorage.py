import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

# Update handleAgree
old_set_accepted = "setAccepted(true);"
new_set_accepted = """setAccepted(true);
      // Fulfill request to update status in localStorage
      localStorage.setItem(`agreement_${id}_status`, 'Signed');"""

content = content.replace(old_set_accepted, new_set_accepted)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
