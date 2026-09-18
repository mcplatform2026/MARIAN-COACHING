const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Remove previewContainerRef, previewScale, pdfHeight states
content = content.replace(/const \[previewScale, setPreviewScale\] = useState\(1\);\n/g, '');
content = content.replace(/const \[pdfHeight, setPdfHeight\] = useState\(1123\);\n/g, '');
content = content.replace(/const previewContainerRef = useRef<HTMLDivElement>\(null\);\n/g, '');

// Remove the resize observer useEffect entirely
content = content.replace(/useEffect\(\(\) => \{\n\s*const updateScale[\s\S]*?\}, \[\]\);\n/g, '');

const oldLayoutStart = `
  return (
    <div
      ref={previewContainerRef}
      className="min-h-screen overflow-x-hidden py-12 px-2 sm:px-6 lg:px-8 font-body text-black flex flex-col items-center "
      style={{ backgroundColor: currentTheme.bg }}
    >
      <div
        style={{
          width: \`\${794 * previewScale}px\`,
          height: \`\${pdfHeight * previewScale}px\`,
          position: "relative",
        }}
      >
        <div
          style={{
            transform: \`scale(\${previewScale})\`,
            transformOrigin: "top left",
            width: "794px",
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            ref={pdfRef}
            className="w-[210mm] shrink-0 bg-white border border-[#d4d4d8] shadow-xl relative"
            style={
              {
                backgroundColor: currentTheme.bg,
                minHeight: "297mm",
                padding: "20mm",
                color: currentTheme.text,
                "--font-headline-family": currentFont.primary,
                "--font-body-family": currentFont.secondary,
              } as React.CSSProperties
            }
          >`;

// We will use a regex to match from `return (` up to `<div ref={pdfRef}` 
// and replace it with a clean structure.

content = content.replace(/return \(\s*<div[\s\S]*?<div\s*ref=\{pdfRef\}[\s\S]*?as React\.CSSProperties\s*\n\s*\}/, 
`return (
    <div
      className="min-h-screen overflow-x-hidden py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex flex-col items-center"
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
        }`);

// Now we need to remove the extra closing </div>s that were added for the wrapper layers.
// It currently ends with:
/*
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Hidden from PDF *\/}
*/
// The PDF block originally had:
// </div> // signatures-block
// </div> // inner body wrapper
// </div> // pdfRef
// </div> // transform container
// </div> // relative container
// </div> // previewContainerRef

// So before the Actions block, there are closing divs. We just need to ensure exactly 3 closing divs (for signatures-block, inner body wrapper, pdfRef) before the Actions block.

const endPattern = /(<\/div>\s*){6}(\{\/\* Actions - Hidden from PDF \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\})/;
content = content.replace(endPattern, 
`</div>
            </div>
          </div>
          
      $2`);

// There is one final closing div needed after the Actions block, which is handled properly if we just keep the end identical.
// Wait, the regex `(<\/div>\s*){6}` might match too many or too few. 
// Let's just find the Actions block and manually strip everything between the end of signatures and the Actions block.

fs.writeFileSync('src/pages/AgreementView.tsx', content);
