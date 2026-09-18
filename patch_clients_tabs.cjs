const fs = require('fs');
const path = 'src/pages/Clients.tsx';
let code = fs.readFileSync(path, 'utf8');

const invoiceTabs = `{field.type === 'invoice_link' && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceLinkType("url");
                                setVal("");
                              }}
                              className={\`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all \${invoiceLinkType === "url" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}\`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceLinkType("app");
                                if (pastInvoices.length > 0 && !(val || "").startsWith("app-invoice:")) {
                                  setVal(\`app-invoice:\${pastInvoices[0].id}\`);
                                } else if (pastInvoices.length === 0) {
                                  setVal("");
                                }
                              }}
                              className={\`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all \${invoiceLinkType === "app" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}\`}
                            >
                              APP
                            </button>
                          </div>
                        )}`;

const agreementTabs = `{field.type === 'agreement_link' && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementLinkType("url");
                                setVal("");
                              }}
                              className={\`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all \${agreementLinkType === "url" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}\`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementLinkType("app");
                                if (agreements.length > 0 && !(val || "").startsWith("app-agreement:")) {
                                  setVal(\`app-agreement:\${agreements[0].id}\`);
                                } else if (agreements.length === 0) {
                                  setVal("");
                                }
                              }}
                              className={\`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all \${agreementLinkType === "app" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}\`}
                            >
                              APP
                            </button>
                          </div>
                        )}`;

if (code.includes(invoiceTabs)) {
    code = code.replace(invoiceTabs, invoiceTabs + "\n                        " + agreementTabs);
} else {
    console.log("Could not find invoiceTabs to inject agreementTabs");
}

fs.writeFileSync(path, code);
