const fs = require('fs');

let content = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// 1. Dispatch event when saving
content = content.replace(
  /localStorage\.setItem\('invoiceLogoData', JSON\.stringify\(\{\n\s*logoImage, brandNamePart1, brandNamePart2\n\s*\}\)\);/g,
  `localStorage.setItem('invoiceLogoData', JSON.stringify({\n          logoImage, brandNamePart1, brandNamePart2\n        }));\n        window.dispatchEvent(new Event("invoiceLogoChange"));`
);

// 2. Add listener to reload data when another device syncs it
if (!content.includes('window.addEventListener("invoiceLogoChange"')) {
  content = content.replace(
    /useEffect\(\(\) => \{\n\s*if \(isLogoLocked\) \{/g,
    `useEffect(() => {
    const handleSync = () => {
      try {
        const data = JSON.parse(localStorage.getItem('invoiceLogoData') || '{}');
        if (data.logoImage !== undefined) setLogoImage(data.logoImage);
        if (data.brandNamePart1 !== undefined) setBrandNamePart1(data.brandNamePart1);
        if (data.brandNamePart2 !== undefined) setBrandNamePart2(data.brandNamePart2);
      } catch (e) {}
    };
    window.addEventListener("invoiceLogoChange", handleSync);
    return () => window.removeEventListener("invoiceLogoChange", handleSync);
  }, []);

  useEffect(() => {
    if (isLogoLocked) {`
  );
}

fs.writeFileSync('src/pages/Invoices.tsx', content);
console.log("Success Invoices");
