import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# Find the block where providerSig is defined and the useEffect
provider_sig_block = r"""
  const initialProviderSig = localStorage.getItem\('agreementProviderSig'\) \|\| null;
  const \[providerSig, setProviderSig\] = useState<string \| null>\(initialProviderSig\);

  useEffect\(\(\) => \{
    if \(isSignaturesLocked\) \{
      if \(providerSig\) localStorage.setItem\('agreementProviderSig', providerSig\);
      else localStorage.removeItem\('agreementProviderSig'\);
    \}
  \}, \[providerSig, isSignaturesLocked\]\);
"""

# Find the lock states
lock_states = r"""
  const \[isContentLocked, setIsContentLocked\] = useState\(\(\) => localStorage.getItem\('agreementContentLocked'\) === 'true'\);
  const \[isSignaturesLocked, setIsSignaturesLocked\] = useState\(\(\) => localStorage.getItem\('agreementSignaturesLocked'\) === 'true'\);
"""

# Actually it's easier to just move the lock states to the very top of the component
# Let's locate the start of the component
component_start = "export function AgreementStudio({ onCancel, onCreate, brandColor, templates, initialData }: AgreementStudioProps) {"

# Let's just do a targeted replacement. We will remove the lock_states from their current position and put them at the top.

# Read line by line
lines = content.split('\n')
new_lines = []
lock_state_lines = []

inside_locks = False
for line in lines:
    if "const [isContentLocked, setIsContentLocked]" in line or "const [isSignaturesLocked, setIsSignaturesLocked]" in line:
        lock_state_lines.append(line)
    else:
        new_lines.append(line)

# Now find where to insert them: right after initialData parsing
insert_idx = -1
for i, line in enumerate(new_lines):
    if "const [formData, setFormData] = useState(initialData);" in line:
        insert_idx = i
        break

if insert_idx != -1:
    new_lines = new_lines[:insert_idx] + lock_state_lines + new_lines[insert_idx:]

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write('\n'.join(new_lines))
