const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

// The inline style for --font-headline-family must use invoice.invoiceTypography, not typography
code = code.replace(
  `const typography = invoice.invoiceTypography || "modern";`,
  `const typography = invoice.invoiceTypography || "modern";`
);

// Actually this looks correct. But let's ensure it maps correctly to the Tailwind classes.
// The issue is likely that in index.css, --font-headline-family is set to Space Grotesk globally,
// and InvoiceView.tsx overrides it correctly inline. 

// Let's remove the "LOREM IPSUM" completely from the navbar just to be absolutely safe, 
// and only show it if it's explicitly not LOREM IPSUM.
code = code.replace(
  `{invoice.logoImage ? "INVOICE DOCUMENT" : <>{invoice.brandNamePart1} <span className="text-neutral-400">{invoice.brandNamePart2}</span></>}`,
  `{invoice.logoImage ? "INVOICE DOCUMENT" : (invoice.brandNamePart1 === "LOREM" ? "INVOICE DOCUMENT" : <>{invoice.brandNamePart1} <span className="text-neutral-400">{invoice.brandNamePart2}</span></>)}`
);

fs.writeFileSync('src/pages/InvoiceView.tsx', code);
