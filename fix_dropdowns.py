import re

files = ['src/pages/Dashboard.tsx', 'src/pages/MonthlyReport.tsx']

dropdown_class = 'w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50'

dashboard_flex_dropdown_class = 'flex-1 sm:flex-none w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50'

style_str = r"""style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>')` }}"""

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # We need to find all <select> tags and replace their className and style
    # Dashboard has 3, MonthlyReport has 2
    
    if 'Dashboard.tsx' in file_path:
        # Currency select
        c1 = r'className="w-full sm:w-auto px-3.5 py-1.5 font-headline font-bold uppercase tracking-wide text-xs border-2 border-black bg-surface-container-lowest focus:outline-none cursor-pointer appearance-none text-black neu-shadow pr-8 min-w-\[90px\]"'
        c1_style = r'style={{ WebkitAppearance: \'none\', backgroundPosition: \'right 0.5rem center\', backgroundRepeat: \'no-repeat\', backgroundSize: \'1rem\', backgroundImage: `url\(\'data:image/svg\+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>\'\)` }}'
        
        # Year select
        c2 = r'className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wide text-xs border-2 border-black bg-surface-container-lowest focus:outline-none cursor-pointer appearance-none text-black neu-shadow pr-8 min-w-\[90px\]"'
        # Month select
        c3 = r'className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wide text-xs border-2 border-black bg-surface-container-lowest focus:outline-none cursor-pointer appearance-none text-black neu-shadow pr-8"'

        content = re.sub(c1, f'className="{dropdown_class}"', content)
        content = re.sub(c2, f'className="{dashboard_flex_dropdown_class}"', content)
        content = re.sub(c3, f'className="{dashboard_flex_dropdown_class}"', content)
        content = re.sub(c1_style, style_str, content)

    elif 'MonthlyReport.tsx' in file_path:
        c1 = r'className="w-full sm:w-auto px-3 py-2 border-2 border-black bg-white font-headline font-bold text-xs uppercase tracking-wider neu-shadow-sm focus:outline-none cursor-pointer text-black"'
        
        # Add style prop after className
        def replacer(match):
            return f'className="{dropdown_class}"\n            {style_str}'

        content = re.sub(c1, replacer, content)

    with open(file_path, 'w') as f:
        f.write(content)
