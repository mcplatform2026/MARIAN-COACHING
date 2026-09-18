const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// 1. Dispatch event when saving
content = content.replace(
  /if \(logoImage\) localStorage\.setItem\('agreementLogo', logoImage\);/g,
  `if (logoImage) { localStorage.setItem('agreementLogo', logoImage); window.dispatchEvent(new Event("agreementLogoChange")); }`
);

// 2. Add listener to reload data when another device syncs it
if (!content.includes('window.addEventListener("agreementLogoChange"')) {
  content = content.replace(
    /useEffect\(\(\) => \{\n\s*if \(isThemeLocked\) \{/g,
    `useEffect(() => {
    const handleSync = () => {
      const data = localStorage.getItem('agreementLogo');
      if (data !== null) setLogoImage(data);
    };
    window.addEventListener("agreementLogoChange", handleSync);
    return () => window.removeEventListener("agreementLogoChange", handleSync);
  }, []);

  useEffect(() => {
    if (isThemeLocked) {`
  );
}

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
console.log("Success Agreement");
