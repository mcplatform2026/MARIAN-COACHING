with open('src/pages/Invoices.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="font-headline font-bold tracking-widest uppercase w-32 pt-1 text-center" style={{ fontSize: "16px" }}\n                          style={{ borderTop: "1px solid #d4d4d4", color: "#1a1c1c" }}',
    'className="font-headline font-bold tracking-widest uppercase w-32 pt-1 text-center"\n                          style={{ borderTop: "1px solid #d4d4d4", color: "#1a1c1c", fontSize: "16px" }}'
)

content = content.replace(
    'className="flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide" style={{ fontSize: "15px" }}\n                      style={{ color: "#262626" }}',
    'className="flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide"\n                      style={{ color: "#262626", fontSize: "15px" }}'
)

with open('src/pages/Invoices.tsx', 'w') as f:
    f.write(content)
