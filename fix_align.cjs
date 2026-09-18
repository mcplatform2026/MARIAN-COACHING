const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// I know exactly what the end of the client signature block looks like.
// It is:
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
// Then I want to insert my Actions block, and then 1 closing div for previewContainerRef.

const searchString = '                    {new Date(agreement.acceptedAt).toLocaleString()}\n                  </p>\n                )}\n              </div>\n            </div>\n          </div>';

const splitIndex = code.indexOf(searchString);
if (splitIndex === -1) {
  console.log("Could not find search string.");
  process.exit(1);
}

// After searchString, there should be some `</div>`s. Let's just hardcode the correct end.
const correctEnd = searchString + `
        </div>
      </div>
    </div>
      
    {/* Actions - Hidden from PDF */}
    <div className="mt-8 mb-16 flex flex-col items-center w-full max-w-3xl" data-html2pdf-ignore="true">
      {!accepted ? (
        <button 
          onClick={handleAgree}
          className="px-8 py-4 bg-primary-container text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none"
        >
          I Agree & Accept
        </button>
      ) : (
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-8 py-4 bg-neutral-900 text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 flex items-center gap-2"
        >
          <Download size={18} /> {downloading ? 'Rendering...' : 'Download PDF Copy'}
        </button>
      )}
    </div>
  </div>
  );
}`;

const before = code.substring(0, splitIndex);
fs.writeFileSync('src/pages/AgreementView.tsx', before + correctEnd);
console.log("File rewritten safely.");
