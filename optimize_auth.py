import re

with open('src/components/AuthProvider.tsx', 'r') as f:
    content = f.read()

old_state = "const [loading, setLoading] = useState(true);"
new_state = """  // If we are in an iframe rendering a zero-cost agreement, we don't need to block render
  const isZeroCostPreview = window.location.pathname.startsWith('/agreement/') && window.location.hash.startsWith('#data=');
  const [loading, setLoading] = useState(!isZeroCostPreview);"""

content = content.replace(old_state, new_state)

with open('src/components/AuthProvider.tsx', 'w') as f:
    f.write(content)
