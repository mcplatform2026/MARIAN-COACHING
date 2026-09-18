import re

def process_file():
    with open('src/pages/Invoices.tsx', 'r') as f:
        content = f.read()

    # Find the bounds of the capture area
    start = content.find('id="invoice-capture-area"')
    end = content.find('{/* Bottom Portion container */}', start)
    
    if start == -1 or end == -1:
        print("Could not find bounds")
        return

    canvas_part = content[start:end]
    
    # We want to find cases like: className="something text-[44px] something" style={{ color: "red" }}
    # It's actually tricky with regex because of React's jsx. 
    # Let's just manually replace the main ones using replace() since there are only about 15 instances.

    # 1. INVOICE text
    canvas_part = canvas_part.replace(
        'className="text-[44px] tracking-tight font-black font-headline leading-none uppercase text-right select-none pr-1"\n                      style={{ color: themes[invoiceTheme].text }}',
        'className="tracking-tight font-black font-headline leading-none uppercase text-right select-none pr-1"\n                      style={{ color: themes[invoiceTheme].text, fontSize: "44px" }}'
    )
    
    # 2. Billed To Name
    canvas_part = canvas_part.replace(
        'className="font-headline font-black text-[24px] tracking-tight leading-tight" style={{ color: themes[invoiceTheme].text }}',
        'className="font-headline font-black tracking-tight leading-tight" style={{ color: themes[invoiceTheme].text, fontSize: "24px" }}'
    )
    
    # 3. Brand Name 1
    canvas_part = canvas_part.replace(
        'className="text-[22px] font-headline font-bold uppercase tracking-tight" style={{ color: "#262626" }}',
        'className="font-headline font-bold uppercase tracking-tight" style={{ color: "#262626", fontSize: "22px" }}'
    )
    
    # 4. Brand Name 2
    canvas_part = canvas_part.replace(
        'className="text-[26px] font-headline font-bold uppercase tracking-tight mt-0.5" style={{ color: themes[invoiceTheme].text }}',
        'className="font-headline font-bold uppercase tracking-tight mt-0.5" style={{ color: themes[invoiceTheme].text, fontSize: "26px" }}'
    )
    
    # 5. Billed To Email
    canvas_part = canvas_part.replace(
        'className="font-body font-medium text-[16px] tracking-tight truncate leading-tight" style={{ color: "#525252" }}',
        'className="font-body font-medium tracking-tight truncate leading-tight" style={{ color: "#525252", fontSize: "16px" }}'
    )
    
    # 6. Invoice Date
    canvas_part = canvas_part.replace(
        'className="font-headline font-bold text-[17px] tracking-tight" style={{ color: themes[invoiceTheme].text }}',
        'className="font-headline font-bold tracking-tight" style={{ color: themes[invoiceTheme].text, fontSize: "17px" }}'
    )
    
    # 7. Invoice No
    canvas_part = canvas_part.replace(
        'className="font-headline font-black text-[18px] tracking-tight pr-0.5" style={{ color: themes[invoiceTheme].text }}',
        'className="font-headline font-black tracking-tight pr-0.5" style={{ color: themes[invoiceTheme].text, fontSize: "18px" }}'
    )
    
    # 8. Description / Price headers
    canvas_part = canvas_part.replace(
        'className="grid grid-cols-12 py-2 border-t-[3px] border-b-[3px] font-headline font-bold text-[18px] tracking-widest uppercase"\n                    style={{ borderColor: themes[invoiceTheme].border, color: themes[invoiceTheme].text }}',
        'className="grid grid-cols-12 py-2 border-t-[3px] border-b-[3px] font-headline font-bold tracking-widest uppercase"\n                    style={{ borderColor: themes[invoiceTheme].border, color: themes[invoiceTheme].text, fontSize: "18px" }}'
    )
    
    # 9. Rows container text size
    canvas_part = canvas_part.replace(
        'className="text-[18px]" style={{ color: themes[invoiceTheme].text }}',
        'className="" style={{ color: themes[invoiceTheme].text, fontSize: "18px" }}'
    )
    
    # 10. Item Title
    canvas_part = canvas_part.replace(
        'className="font-headline font-bold text-[18px] tracking-tight leading-snug flex-wrap break-words" style={{ color: themes[invoiceTheme].text }}',
        'className="font-headline font-bold tracking-tight leading-snug flex-wrap break-words" style={{ color: themes[invoiceTheme].text, fontSize: "18px" }}'
    )
    
    # 11. Item Price
    canvas_part = canvas_part.replace(
        'className="col-span-2 text-right font-headline font-black whitespace-nowrap text-[18px]" style={{ color: themes[invoiceTheme].text }}',
        'className="col-span-2 text-right font-headline font-black whitespace-nowrap" style={{ color: themes[invoiceTheme].text, fontSize: "18px" }}'
    )

    content = content[:start] + canvas_part + content[end:]
    
    
    # Now for the bottom portion
    start2 = end
    end2 = content.find('Drawing pristine invoice print canvas', start2)
    
    if start2 != -1 and end2 != -1:
        bottom_part = content[start2:end2]
        
        # Total Label
        bottom_part = bottom_part.replace(
            'className="font-headline font-black text-[16px] tracking-wider mr-2 uppercase" style={{ color: "#737373" }}',
            'className="font-headline font-black tracking-wider mr-2 uppercase" style={{ color: "#737373", fontSize: "16px" }}'
        )
        
        # Total Amount
        bottom_part = bottom_part.replace(
            'className="font-headline font-black text-[32px] pl-1" style={{ color: themes[invoiceTheme].text }}',
            'className="font-headline font-black pl-1" style={{ color: themes[invoiceTheme].text, fontSize: "32px" }}'
        )
        
        # Payment details header
        bottom_part = bottom_part.replace(
            'className="font-headline font-black uppercase text-[16px] tracking-wider mb-1" style={{ color: "#1a1c1c" }}',
            'className="font-headline font-black uppercase tracking-wider mb-1" style={{ color: "#1a1c1c", fontSize: "16px" }}'
        )
        
        # Payment details text
        bottom_part = bottom_part.replace(
            'className="text-[16px] leading-relaxed font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626" }}',
            'className="leading-relaxed font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626", fontSize: "16px" }}'
        )
        
        # Thank You message
        bottom_part = bottom_part.replace(
            'className="font-headline font-black text-[32px] tracking-tight uppercase leading-none select-none whitespace-nowrap overflow-hidden text-ellipsis"',
            'className="font-headline font-black tracking-tight uppercase leading-none select-none whitespace-nowrap overflow-hidden text-ellipsis"\n                    style={{ fontSize: "32px" }}'
        )
        
        content = content[:start2] + bottom_part + content[end2:]

    with open('src/pages/Invoices.tsx', 'w') as f:
        f.write(content)
        
    print("Replacements done!")

process_file()
