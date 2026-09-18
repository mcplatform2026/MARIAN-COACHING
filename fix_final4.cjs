const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const replacement = `  if (loading && !agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100">
        <div className="bg-white border-2 border-red-500 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-red-700 font-headline font-black uppercase text-xl mb-2">
            Error
          </h2>
          <p className="text-neutral-600 font-body text-sm font-medium leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  const currentTheme = themes.white;
  const currentFont =
    typographyFonts.find((f) => f.id === agreement.invoiceTypography) ||
    typographyFonts[0];

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex flex-col items-center overflow-x-hidden"
      style={{ backgroundColor: currentTheme.bg }}
    >
      <div
        ref={pdfRef}
        className="w-full max-w-[794px] bg-white border border-[#d4d4d8] shadow-xl relative shrink-0"
        style={
          {
            backgroundColor: currentTheme.bg,
            minHeight: "297mm",
            padding: "min(20mm, 5%)",
            color: currentTheme.text,
            "--font-headline-family": currentFont.primary,
            "--font-body-family": currentFont.secondary,
          } as React.CSSProperties
        }
      >
        {accepted && (
          <div
            className="absolute top-4 right-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 border-2 border-emerald-600 rounded-full font-headline font-bold uppercase text-[10px]"
            data-html2pdf-ignore="true"
          >
            <Check size={14} /> Accepted
          </div>
        )}

        <div style={{ fontFamily: "var(--font-body-family)" }}>`;

// find the start of `if (loading && !agreement) {`
const startIdx = content.indexOf('if (loading && !agreement) {');
// find the start of `<div style={{ fontFamily: "var(--font-body-family)" }}>`
const endSearchStr = '<div style={{ fontFamily: "var(--font-body-family)" }}>';
const endIdx = content.indexOf(endSearchStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx + endSearchStr.length);
  fs.writeFileSync('src/pages/AgreementView.tsx', before + replacement + after);
  console.log("Fixed!");
} else {
  console.log("Could not find blocks");
}
