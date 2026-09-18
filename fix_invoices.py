import re

with open('src/pages/Invoices.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('{/* SECTION B: PAST INVOICES HISTORY */}')
if start_idx != -1:
    tail = content[start_idx:]
    
    # Invert the text replacements exactly
    replacements = [
        ('text-[14px]', 'text-[10px]'),
        ('text-[18px]', 'text-sm'),  # this will also reverse 'text-sm' to 'text-[18px]' that we did. wait, let's look at the original code.
        ('text-base', 'text-[12px]'),
        ('text-[17px]', 'text-[13px]'),
        # text-[18px] from text-[14px] overlaps with text-[18px] from text-sm.
        # But 'text-sm' was used originally in the tail? Let's check.
        ('text-[16px]', 'text-xs'),
        ('text-[28px]', 'text-2xl'),
        ('text-[13px]', 'text-[9px]'),
        ('text-[32px]', 'text-[28px]'),
        ('text-[15px]', 'text-[11px]')
    ]
    
    for old, new in replacements:
        tail = tail.replace(old, new)
        
    content = content[:start_idx] + tail

with open('src/pages/Invoices.tsx', 'w') as f:
    f.write(content)

