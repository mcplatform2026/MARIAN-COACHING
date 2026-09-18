const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// The return block starts at:
//   return (
//     <div ref={previewContainerRef} className="...">
//       <div style={{ width: ..., height: ..., position: 'relative' }}>
//         <div style={{ transform: ..., ... }}>
//       <div ref={pdfRef} ...>

// So previewContainerRef is the root. (1)
// Scale wrapper is (2).
// Transform wrapper is (3).
// pdfRef is (4).

// We want to close (4), (3), (2) BEFORE the Actions block.
// Then put Actions block.
// Then close (1).

// Let's grab everything up to Actions block.
const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
const beforeActions = code.substring(0, actionsStart);
const afterActions = code.substring(actionsStart);

// We need to count exactly how many divs need to be closed in beforeActions.
// A clean way is just to manually rewrite the end of beforeActions.
// Wait, the easiest way is to find where the Client Signature flex row ends.
// Let's do a strict parse.
// Let's just strip ALL trailing closing divs and whitespace from beforeActions.
const cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');

// `cleanBefore` now ends at the innermost content (the client signature text).
// How many divs are open there?
const opened = (cleanBefore.match(/<div/g) || []).length;
const closed = (cleanBefore.match(/<\/div>/g) || []).length;
const stillOpen = opened - closed; 
// stillOpen should be the number of open divs. We want to close all but 1 (the previewContainerRef).
const divsToClose = stillOpen - 1;

let newCode = cleanBefore + '\n';
for(let i=0; i<divsToClose; i++) {
  newCode += '      </div>\n';
}

newCode += '      \n      {/* Actions - Hidden from PDF */}\n';

// Now we want the Actions block. We need to extract the Actions block from afterActions, 
// and then close the final div.
// afterActions looks like:
// {/* Actions ... */}
// <div ...> ... </div>
// </div> </div> </div> ...

const actionsMatch = afterActions.match(/\{\/\* Actions - Hidden from PDF \*\/\}\s*(<div[\s\S]*?<\/div>)\s*(<\/div>)*\s*$/);
if (actionsMatch) {
  newCode += '      ' + actionsMatch[1] + '\n    </div>\n  );\n}';
  fs.writeFileSync('src/pages/AgreementView.tsx', newCode);
  console.log("Fixed! Still open initially:", stillOpen, "Closed:", divsToClose);
} else {
  console.log("Could not match Actions block correctly.");
}
