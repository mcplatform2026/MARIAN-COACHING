const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

const oldInvoiceBlock = `} else if (field?.type === 'invoice_link') {
                         displayVal = displayVal ? (
                           displayVal.startsWith("app-invoice:") ? (
                             <button
                               onClick={() => handleViewAppInvoice(displayVal.substring(12))}
                               className="text-red-500 underline font-bold"
                             >
                               App Invoice
                             </button>
                           ) : (
                             <a href={displayVal} target="_blank" rel="noreferrer" className="text-red-500 underline font-bold" title={displayVal}>
                               External Invoice
                             </a>
                           )
                         ) : <span className="text-neutral-400">--</span>;
                      } else if (field?.type === 'agreement_link') {
                         displayVal = displayVal ? (
                           displayVal.startsWith("app-agreement:") ? (
                             <button
                               onClick={() => handleViewAppAgreement(displayVal.substring(14))}
                               className="text-blue-500 underline font-bold"
                             >
                               App Agreement
                             </button>
                           ) : (
                             <a href={displayVal} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold" title={displayVal}>
                               External Agreement
                             </a>
                           )
                         ) : <span className="text-neutral-400">--</span>;
                      }`;

const newInvoiceBlock = `} else if (field?.type === 'invoice_link') {
                         const strVal = displayVal;
                         displayVal = strVal ? (
                           strVal.startsWith("app-invoice:") ? (
                             <button
                               onClick={() => handleViewAppInvoice(strVal.substring(12))}
                               className="text-red-500 underline font-bold"
                             >
                               App Invoice
                             </button>
                           ) : (
                             <a href={strVal} target="_blank" rel="noreferrer" className="text-red-500 underline font-bold" title={strVal}>
                               External Invoice
                             </a>
                           )
                         ) : <span className="text-neutral-400">--</span>;
                      } else if (field?.type === 'agreement_link') {
                         const strVal = displayVal;
                         displayVal = strVal ? (
                           strVal.startsWith("app-agreement:") ? (
                             <button
                               onClick={() => handleViewAppAgreement(strVal.substring(14))}
                               className="text-blue-500 underline font-bold"
                             >
                               App Agreement
                             </button>
                           ) : (
                             <a href={strVal} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold" title={strVal}>
                               External Agreement
                             </a>
                           )
                         ) : <span className="text-neutral-400">--</span>;
                      }`;

if (code.includes(oldInvoiceBlock)) {
    code = code.replace(oldInvoiceBlock, newInvoiceBlock);
} else {
    console.log("Could not find the block to replace.");
}

fs.writeFileSync('src/pages/Clients.tsx', code);
