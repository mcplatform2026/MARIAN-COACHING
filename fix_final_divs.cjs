const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Find the Actions block start
const actionsStart = code.indexOf('{/* Actions - Hidden from PDF */}');
const beforeActions = code.substring(0, actionsStart);

// At the end of beforeActions, we want EXACTLY 7 </div> tags to close everything inside previewContainerRef, including the width/height wrapper.
const cleanBefore = beforeActions.replace(/(<\/div>\s*)+$/, '');
const newBefore = cleanBefore + '\n' + '        </div>\n'.repeat(7) + '        ';

const afterActions = code.substring(actionsStart);
// at the end of afterActions, we want exactly ONE </div> tag before );
const cleanAfter = afterActions.replace(/(<\/div>\s*)+\);\s*\}\s*$/, '        </div>\n      </div>\n    </div>\n  );\n}\n');
// wait, the regex above will just replace with what I gave it. Let's make it exactly correct.
const correctAfter = afterActions.replace(/(<\/div>\s*)+\);\s*\}\s*$/, '        </div>\n    </div>\n  );\n}\n');

// Wait, let's just do it cleanly:
const actionsMatch = afterActions.match(/\{\/\* Actions - Hidden from PDF \*\/\}([\s\S]*?)<\/div>\s*(<\/div>\s*)*\);\s*\}/);

if (actionsMatch) {
  let content = actionsMatch[1]; // this is everything inside the Actions block, minus the closing div of the Actions block itself
  let finalCode = newBefore + '{/* Actions - Hidden from PDF */}' + content + '        </div>\n    </div>\n  );\n}\n';
  fs.writeFileSync('src/pages/AgreementView.tsx', finalCode);
  console.log("Rewrote perfectly!");
} else {
  console.log("Regex did not match");
}

