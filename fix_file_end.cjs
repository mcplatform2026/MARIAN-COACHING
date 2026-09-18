const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// We want to replace everything after the signatures block closing div up to the end of the file.
// The signatures block looks like:
//               </div> {/* Client Signature */}
//             </div>
//           </div>
//         </div>
//       </div>

// Let's just find the signatures block and replace everything after it.
const regex = /\{\/\* Client Signature \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Actions - Hidden from PDF \*\/\}[\s\S]*?\);\s*\}/;

const match = code.match(/\{\/\* Client Signature \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
if (match) {
  // Let's just manually replace the last chunks using lastIndexOf
  const splitPoint = code.lastIndexOf('{/* Actions - Hidden from PDF */}');
  
  // Find where the pdfRef ends
  // Wait, let's just use string replacement on the exact messed up part:
}

// Let's be safer.
code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\*\s*Actions - Hidden from PDF\s*\*\/\}/, `</div>
      </div>
    </div>
    
    {/* Actions - Hidden from PDF */}`);

// Let's actually just count the divs and put them right.
