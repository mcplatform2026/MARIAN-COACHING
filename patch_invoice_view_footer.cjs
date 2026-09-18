const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

// The main issues described are:
// 1. Phone number wrapping
// 2. "Lorem" in signature area if no image
// 3. Fonts not applying properly (the inline variables need to be mapped to the actual google fonts if they aren't loaded in index.css)
// 4. Width difference (794px vs 600px)

// Let's first fix the width to 600px to match Invoices.tsx
code = code.replace(/w-\[794px\]/g, 'w-[600px]');

// Fix the phone wrapping
const badFooter = `            <div id="footer-contact-row" className="flex flex-row items-center justify-center gap-6 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide text-[10px] opacity-60">
              {invoice.phone && <span className="flex items-center gap-1.5">{invoice.phone}</span>}
              {invoice.email && <span className="flex items-center gap-1.5">{invoice.email}</span>}
              {invoice.website && <span className="flex items-center gap-1.5">{invoice.website}</span>}
            </div>`;

const goodFooter = `            <div id="footer-contact-row" className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full mx-auto font-bold font-headline uppercase tracking-wide" style={{ color: "#262626", fontSize: "13px" }}>
              {invoice.phone && <span className="flex items-center gap-1.5 whitespace-nowrap">{invoice.phone}</span>}
              {invoice.email && <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">{invoice.email}</span>}
              {invoice.website && <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">{invoice.website}</span>}
            </div>`;

code = code.replace(badFooter, goodFooter);

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
console.log('Fixed InvoiceView layout');
