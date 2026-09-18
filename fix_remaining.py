import re

with open('src/pages/Invoices.tsx', 'r') as f:
    content = f.read()

start = content.find('id="invoice-capture-area"')
end = content.find('{/* Bottom Portion container */}', start)
end2 = content.find('Drawing pristine invoice print canvas', start)

if start != -1 and end2 != -1:
    canvas_part = content[start:end2]
    
    # regex replace text-[Npx] to remove it from className and put it into style
    # actually, regex is hard because style might not exist or already exists.
    # Just do simple replace for the few lines left.

    replacements = {
        'className="grid grid-cols-2 pt-6 pb-6 text-[18px]"': 'className="grid grid-cols-2 pt-6 pb-6" style={{ fontSize: "18px" }}',
        'className="font-headline font-bold text-[11px] tracking-widest uppercase" style={{ color: "#737373" }}': 'className="font-headline font-bold tracking-widest uppercase" style={{ color: "#737373", fontSize: "11px" }}',
        'className="font-headline font-bold text-[11px] tracking-widest text-[#5e5e5e] uppercase"': 'className="font-headline font-bold tracking-widest text-[#5e5e5e] uppercase" style={{ fontSize: "11px" }}',
        'className="font-headline font-black uppercase text-[13px] tracking-wider mb-0.5" style={{ color: "#1a1c1c" }}': 'className="font-headline font-black uppercase tracking-wider mb-0.5" style={{ color: "#1a1c1c", fontSize: "13px" }}',
        'className="text-[10px] leading-normal font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626" }}': 'className="leading-normal font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626", fontSize: "10px" }}',
        'className="font-headline font-bold text-[16px] tracking-widest uppercase w-32 pt-1 text-center"': 'className="font-headline font-bold tracking-widest uppercase w-32 pt-1 text-center" style={{ fontSize: "16px" }}',
        'className="flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto text-[15px] font-bold font-headline uppercase tracking-wide"': 'className="flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide" style={{ fontSize: "15px" }}',
    }

    for k, v in replacements.items():
        canvas_part = canvas_part.replace(k, v)

    content = content[:start] + canvas_part + content[end2:]
    
    with open('src/pages/Invoices.tsx', 'w') as f:
        f.write(content)
