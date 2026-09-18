const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Find the start of the `Actions - Hidden from PDF` block
const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
const beforeActions = code.substring(0, actionsStart);
const afterActions = code.substring(actionsStart);

// At the end of beforeActions, there are a bunch of </div> tags.
// Let's strip ALL trailing whitespace and </div> tags.
let cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');

// Now we manually append exactly 3 closing divs:
// one for pdfRef, one for transform, one for width/height.
// The root `previewContainerRef` div stays open.
cleanBefore += '\n      </div>\n    </div>\n  </div>\n\n  ';

fs.writeFileSync('src/pages/AgreementView.tsx', cleanBefore + afterActions);
