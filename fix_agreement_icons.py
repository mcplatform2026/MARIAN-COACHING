import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# Make sure we import all necessary icons
if 'Building2' not in content:
    content = content.replace("Palette, ", "Palette, Building2, UserCircle, PenTool as PenToolIcon, ")

# 1. Logo & Styling Header
pattern_logo = r'<h3.*?Logo \& Styling.*?</h3>'
repl_logo = """<h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-600" /> Logo & Styling
          </h3>"""
content = re.sub(pattern_logo, repl_logo, content)

# 2. Client & Document Details
pattern_client = r'<h3.*?Client \& Document Details.*?</h3>'
repl_client = """<h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-600" /> Client & Document Details
          </h3>"""
content = re.sub(pattern_client, repl_client, content)

# 3. Typography & Theme section already have lock buttons, but we can add icons to their labels.
# Wait, they are inside the Logo & Styling section, it's just one big section.

# 4. Project Scope & Content
# Already has <PenTool className="w-4 h-4 text-blue-600" /> 
# But wait, PenTool is used both there and in Signatures. Let's make sure.

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)
