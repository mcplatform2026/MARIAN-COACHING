const fs = require('fs');

let content = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Remove 'sand' from ThemeKey
content = content.replace(/type ThemeKey = "white" \| "alabaster" \| "nordic" \| "sage" \| "sand";/, 'type ThemeKey = "white" | "alabaster" | "nordic" | "sage";');

// Remove sand from themes
const sandRegex = /,\s*sand:\s*\{\s*bg:\s*"#[A-Fa-f0-9]+",\s*cardBg:\s*"#[A-Fa-f0-9]+",\s*text:\s*"#[A-Fa-f0-9]+",\s*label:\s*"[^"]+",\s*border:\s*"[^"]+",\s*rowSeparator:\s*"[^"]+",\s*accent:\s*"[^"]+"\s*\}/;
content = content.replace(sandRegex, '');

// Remove elegant from typography options
content = content.replace(/\s*\{\s*id:\s*'elegant',\s*label:\s*'Elegant \(Plus Jakarta Sans\)'\s*\}\s*,?/, '');

// Remove elegant from usage
content = content.replace(/invoiceTypography === 'elegant' \? "'Plus Jakarta Sans', sans-serif" :\s*/g, '');

fs.writeFileSync('src/pages/Invoices.tsx', content);
