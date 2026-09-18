const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// I'll split by {/* Actions - Hidden from PDF */}
const parts = code.split('{/* Actions - Hidden from PDF */}');

// The first part ends with:
//         </div>
//       </div>
//     </div>
// We need to keep only 2 closing divs (to close the scale wrapper and the relative positioning wrapper),
// so that previewContainerRef stays open.
// Then we output Actions, and then ONE closing div (to close previewContainerRef).

// Let's strip out ALL `</div>` tags from the end of the first part, going backwards, up to the clientSignature block
const firstPart = parts[0];

// Let's find exactly where the `clientName` block ends.
// In the client signature flex col:
//                 <p className="font-headline font-bold uppercase tracking-wide text-xs mt-4" style={{ fontFamily: 'var(--font-headline-family)' }}>{agreement.clientName}</p>
//                 {accepted && (
//                   <p className="font-body text-xs mt-1 opacity-60">
//                     {new Date(agreement.acceptedAt).toLocaleString()}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

const cleanFirstPart = firstPart.substring(0, firstPart.lastIndexOf('</div>', firstPart.lastIndexOf('</div>') - 50)); // let's just do a regex replace from "Client Signature" to the end of firstPart

// Even better, let's use the explicit structure.
const structureRegex = /(<p className="font-body text-xs mt-1 opacity-60">[^<]+<\/p>\s*)\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>[\s\S]*$/;
