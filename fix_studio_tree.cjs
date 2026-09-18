const fs = require('fs');

let studioContent = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

studioContent = studioContent.replace(
  /<div className="mt-16 pt-8 border-t-2 signatures-block" style=\{\{ borderColor: themes\.white\.border \}\}>\s*<h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style=\{\{ fontFamily: 'var\(--font-headline-family\)' \}\}>Signatures & Execution<\/h3>\s*<div className="flex flex-row gap-8 w-full">/g,
  `<div className="mt-16 pt-8 border-t-2 signatures-block flex flex-col" style={{ borderColor: themes.white.border }}>
                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
                <div className="flex flex-row gap-8 w-full">`
);

// We need to add the closing div after the two signature flex-1 items.
// Let's find the place:
//                 </div>
//               </div>
//             </div>
//           </div>
//           </div>
//         </div>
// It's probably easier to just replace the whole block since it's just the end of the file.
