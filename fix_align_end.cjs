const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
let beforeActions = code.substring(0, actionsStart);

// We want to make sure beforeActions closes exactly the pdfRef, transform, and size wrappers.
// Currently, beforeActions ends with a bunch of `</div>`.
// Let's remove all trailing `</div>` and whitespace.
let cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');

// Now we need to append EXACTLY the right number of `</div>`s to close everything EXCEPT `previewContainerRef`.
// Since we know the exact nesting, we know we are inside `clientSignature` wrapper, which is deeply nested.
// Let's find out how many open divs are left in `cleanBefore` by using a simple parser or just finding the 
// specific text element that precedes it.

const lastText = '{new Date(agreement.acceptedAt).toLocaleString()}';
const lastTextIndex = cleanBefore.lastIndexOf(lastText);
if (lastTextIndex === -1) throw new Error("Could not find last text");

