const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// 1. Update the typographyFonts array to match Invoice (Modern, Classic, Minimal, Tech)
content = content.replace(
  /const typographyFonts = \[[\s\S]*?\];/,
  `const typographyFonts = [
    { id: "modern", name: "Modern (Space Grotesk)", primary: "'Space Grotesk', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
    { id: "classic", name: "Classic (Inter)", primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { id: "minimal", name: "Minimal (Plus Jakarta)", primary: "'Plus Jakarta Sans', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
    { id: "tech", name: "Tech (Sora)", primary: "'Sora', sans-serif", secondary: "'Sora', sans-serif" }
  ];`
);

// 2. Add the CSS variables to the main wrapper
content = content.replace(
  /<div className="flex flex-col lg:flex-row gap-6 h-full w-full">/,
  `<style>
        .tiptap-editor { font-family: var(--font-body-family) !important; }
        .tiptap-editor h1, .tiptap-editor h2 { font-family: var(--font-headline-family) !important; text-transform: uppercase; font-weight: 800; }
      </style>
      <div className="flex flex-col lg:flex-row gap-6 h-full w-full agreement-studio-wrapper"
        style={{
          '--font-headline-family': invoiceTypography === 'modern' ? "'Space Grotesk', sans-serif" :
                                   invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                                   invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                                   "'Plus Jakarta Sans', sans-serif",
          '--font-body-family': invoiceTypography === 'modern' ? "'Plus Jakarta Sans', sans-serif" :
                               invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                               invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                               "'Plus Jakarta Sans', sans-serif"
        } as React.CSSProperties}
      >`
);

// 3. Update the preview styles
content = content.replace(
  /(\.studio-tiptap h1 \{[^\}]+\})/,
  `.studio-tiptap, .text-xs\.opacity-80, .text-xs\.opacity-60 { font-family: var(--font-body-family) !important; }
                  $1`
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
