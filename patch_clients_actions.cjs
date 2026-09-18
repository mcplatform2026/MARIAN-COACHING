const fs = require('fs');
const path = 'src/pages/Clients.tsx';
let code = fs.readFileSync(path, 'utf8');

const handleViewAppInvoice = `const handleViewAppInvoice = (invId: string) => {
    localStorage.setItem('viewInvoiceId', invId);
    navigate('/invoices');
  };`;

const handleViewAppAgreement = `const handleViewAppAgreement = (agrId: string) => {
    localStorage.setItem('viewAgreementId', agrId);
    navigate('/agreements');
  };`;

if (code.includes(handleViewAppInvoice)) {
    code = code.replace(handleViewAppInvoice, handleViewAppInvoice + "\n\n  " + handleViewAppAgreement);
}

const invoiceLinkDisplay = `} else if (field?.type === 'invoice_link') {
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
                         ) : <span className="text-neutral-400">--</span>;`;

const agreementLinkDisplay = `} else if (field?.type === 'agreement_link') {
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
                         ) : <span className="text-neutral-400">--</span>;`;

if (code.includes(invoiceLinkDisplay)) {
    code = code.replace(invoiceLinkDisplay, invoiceLinkDisplay + "\n                      " + agreementLinkDisplay);
} else {
    // If exact match fails, let's use regex
    const invoiceLinkRegex = /} else if \(field\?\.type === 'invoice_link'\) \{[\s\S]*?\} else if/g;
    // Actually we can just do a normal find
    console.log("Could not find invoiceLinkDisplay exact match");
}

fs.writeFileSync(path, code);
