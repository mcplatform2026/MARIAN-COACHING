import re

with open('src/pages/Invoices.tsx', 'r') as f:
    content = f.read()

# 1. Replace the state initializations
old_states = """  // Theme selection for creative backgrounds
  const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>("alabaster");
  const [invoiceTypography, setInvoiceTypography] = useState<string>("modern");"""

new_states = """  // Locks for theme and typography
  const [isThemeLocked, setIsThemeLocked] = useState(() => localStorage.getItem('invoiceThemeLocked') === 'true');
  const [isTypographyLocked, setIsTypographyLocked] = useState(() => localStorage.getItem('invoiceTypographyLocked') === 'true');
  
  const initialThemeData = (() => { try { return localStorage.getItem('invoiceThemeData'); } catch { return null; } })();
  const initialTypographyData = (() => { try { return localStorage.getItem('invoiceTypographyData'); } catch { return null; } })();

  // Theme selection for creative backgrounds
  const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>((isThemeLocked && initialThemeData) ? (initialThemeData as ThemeKey) : "alabaster");
  const [invoiceTypography, setInvoiceTypography] = useState<string>((isTypographyLocked && initialTypographyData) ? initialTypographyData : "modern");"""

content = content.replace(old_states, new_states)

# 2. Add useEffects
old_use_effects = """  useEffect(() => {
    if (isItemsLocked) {
      try {
        localStorage.setItem('invoiceItemsData', JSON.stringify(items));
      } catch(e) { console.error(e) }
    }
  }, [isItemsLocked, items]);"""

new_use_effects = """  useEffect(() => {
    if (isItemsLocked) {
      try {
        localStorage.setItem('invoiceItemsData', JSON.stringify(items));
      } catch(e) { console.error(e) }
    }
  }, [isItemsLocked, items]);

  useEffect(() => {
    if (isThemeLocked) {
      try { localStorage.setItem('invoiceThemeData', invoiceTheme); } catch(e) { console.error(e) }
    }
  }, [isThemeLocked, invoiceTheme]);

  useEffect(() => {
    if (isTypographyLocked) {
      try { localStorage.setItem('invoiceTypographyData', invoiceTypography); } catch(e) { console.error(e) }
    }
  }, [isTypographyLocked, invoiceTypography]);"""

content = content.replace(old_use_effects, new_use_effects)

# 3. Add Theme Lock button
old_theme_header = """            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-600" />
              Creative Background Theme
            </h3>"""

new_theme_header = """            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 mb-0 pb-0 border-0">
                <Palette className="w-4 h-4 text-blue-600" />
                Creative Background Theme
              </h3>
              <button
                onClick={() => {
                  const newLock = !isThemeLocked;
                  setIsThemeLocked(newLock);
                  localStorage.setItem('invoiceThemeLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isThemeLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isThemeLocked ? "Unlock Theme Settings" : "Lock Theme Settings (Applies to new invoices)"}
              >
                {isThemeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>"""

content = content.replace(old_theme_header, new_theme_header)

# 4. Add Typography Lock button
old_typo_header = """            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 mb-3 flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              Invoice Typography
            </h3>"""

new_typo_header = """            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 mb-0 pb-0 border-0">
                <Type className="w-4 h-4" />
                Invoice Typography
              </h3>
              <button
                onClick={() => {
                  const newLock = !isTypographyLocked;
                  setIsTypographyLocked(newLock);
                  localStorage.setItem('invoiceTypographyLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isTypographyLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isTypographyLocked ? "Unlock Typography Settings" : "Lock Typography Settings (Applies to new invoices)"}
              >
                {isTypographyLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>"""

content = content.replace(old_typo_header, new_typo_header)

# 5. subtextClasses replacement
old_subtext = """  const subtextClasses = {
    light: "font-sans font-light text-[11px] tracking-wide leading-normal mt-0.5 block",
    mono: "font-mono font-medium text-[10px] uppercase tracking-normal mt-1 block",
    italic: "font-sans italic font-normal text-[11px] mt-0.5 block leading-normal",
    compact: "font-headline font-semibold text-[10px] tracking-widest uppercase mt-1 block"
  };"""

new_subtext = """  const subtextClasses = {
    light: "font-sans font-light text-[15px] tracking-wide leading-normal mt-0.5 block",
    mono: "font-mono font-medium text-[14px] uppercase tracking-normal mt-1 block",
    italic: "font-sans italic font-normal text-[15px] mt-0.5 block leading-normal",
    compact: "font-headline font-semibold text-[14px] tracking-widest uppercase mt-1 block"
  };"""

content = content.replace(old_subtext, new_subtext)

# 6. Capture Area Font size replacements
# We only want to replace sizes within the `<div id="invoice-capture-area"`
start_idx = content.find('id="invoice-capture-area"')
end_idx = content.find('id="invoice-actions"')
if end_idx == -1: end_idx = len(content)

if start_idx != -1:
    capture_area = content[start_idx:end_idx]
    
    # Text replacements (+4px mapping roughly)
    replacements = {
        'text-[10px]': 'text-[14px]',
        'text-sm': 'text-[18px]',
        'text-[12px]': 'text-base', # 16px
        'text-[13px]': 'text-[17px]',
        'text-[14px]': 'text-[18px]',
        'text-xs': 'text-[16px]', # 12px -> 16px
        'text-2xl': 'text-[28px]', # 24px -> 28px
        'text-[9px]': 'text-[13px]',
        'text-[28px]': 'text-[32px]',
        'text-[11px]': 'text-[15px]'
    }
    
    for old, new in replacements.items():
        capture_area = capture_area.replace(old, new)
        
    content = content[:start_idx] + capture_area + content[end_idx:]

with open('src/pages/Invoices.tsx', 'w') as f:
    f.write(content)

