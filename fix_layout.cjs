const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Remove previewContainerRef, previewScale, pdfHeight states
content = content.replace(/const \[previewScale, setPreviewScale\].*\n/g, '');
content = content.replace(/const \[pdfHeight, setPdfHeight\].*\n/g, '');
content = content.replace(/const previewContainerRef = useRef<HTMLDivElement>\(null\);\n/g, '');

// Remove the resize observer useEffect entirely
content = content.replace(/useEffect\(\(\) => \{\n\s*const updateScale[\s\S]*?\}, \[\]\);\n/g, '');

// Fix the return structure
const returnStart = content.indexOf('return (');
const everythingBeforeReturn = content.substring(0, returnStart);

// We'll replace the entire return block to guarantee it's perfectly clean and functional.
// We extract the actions block from the original content to preserve it exactly.
const actionsMatch = content.match(/\{\/\* Actions - Hidden from PDF \*\/\}[\s\S]*?<button[\s\S]*?<\/button>\s*\)\s*\}\s*<\/div>/);
const actionsBlock = actionsMatch ? actionsMatch[0] : '';

// And we extract the header and tiptap content, and signatures
// The PDF content starts with `{accepted && ( ... <div style={{ fontFamily: "var(--font-body-family)" }}>`
const pdfContentMatch = content.match(/\{accepted && \([\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Actions)/);

let innerContent = "";
if (pdfContentMatch) {
  // It matched all the way to the end of the PDF content
  innerContent = pdfContentMatch[0];
  // Wait, let's just find the start of `{accepted &&` inside `ref={pdfRef}`
  const acceptedStart = content.indexOf('{accepted && (');
  // and the end of the signatures block.
  // Actually, we can just replace the layout wrappers.
}

