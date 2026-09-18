import re

files = [
    'src/components/AgreementStudio.tsx', 
    'src/pages/AgreementView.tsx', 
    'src/pages/DocumentView.tsx',
    'src/pages/Invoices.tsx',
    'src/pages/Agreements.tsx'
]

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # In AgreementStudio, ensure invoiceTheme falls back to white if not in themes
        if 'AgreementStudio' in filepath:
            # Look for useState defining invoiceTheme
            content = re.sub(
                r'const \[invoiceTheme, setInvoiceTheme\] = useState<ThemeKey>\([^)]+\);',
                r'const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>(() => {\n    const saved = localStorage.getItem("agreementTheme") as ThemeKey;\n    return (saved && themes[saved]) ? saved : "white";\n  });',
                content
            )
            # Find any themes[invoiceTheme].bg and replace with (themes[invoiceTheme] || themes.white).bg
            content = re.sub(
                r'themes\[([^\]]+)\]\.bg',
                r'(themes[\1] || themes.white).bg',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.cardBg',
                r'(themes[\1] || themes.white).cardBg',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.text',
                r'(themes[\1] || themes.white).text',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.border',
                r'(themes[\1] || themes.white).border',
                content
            )

        # In Invoices
        if 'Invoices.tsx' in filepath:
            content = re.sub(
                r'themes\[([^\]]+)\]\.bg',
                r'(themes[\1] || themes.white).bg',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.text',
                r'(themes[\1] || themes.white).text',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.border',
                r'(themes[\1] || themes.white).border',
                content
            )
            content = re.sub(
                r'themes\[([^\]]+)\]\.rowSeparator',
                r'(themes[\1] || themes.white).rowSeparator',
                content
            )
            content = re.sub(
                r'const \[invoiceTheme, setInvoiceTheme\] = useState<ThemeKey>\([^)]+\);',
                r'const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>(() => {\n    const saved = localStorage.getItem("invoiceTheme") as ThemeKey;\n    return (saved && themes[saved]) ? saved : "white";\n  });',
                content
            )
            
            # also replace the ThemeKey type and themes dict if it has blush
            content = content.replace(
                'type ThemeKey = "white" | "alabaster" | "nordic" | "blush" | "sage";',
                'type ThemeKey = "white" | "alabaster" | "nordic" | "sage";'
            )
            content = re.sub(r'\s*blush: \{[^\}]+\},', '', content)

        # In Views, it uses currentTheme = themes[agreement.invoiceTheme] || themes.white; which is already safe!
        # But let's check
        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error in {filepath}: {e}")

print("Fixed themes")
