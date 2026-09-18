import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# I want to add the isLocked logic. 
# Search for the content editor wrapper, and add the lock system.
# InvoiceStudio has `const [lockedSections, setLockedSections] = useState<Record<string, boolean>>({});` or similar? Let's use a simpler `isDetailsLocked` for now, or check InvoiceStudio

