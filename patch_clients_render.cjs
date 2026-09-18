const fs = require('fs');
const path = 'src/pages/Clients.tsx';
let code = fs.readFileSync(path, 'utf8');

const invoiceLinkBlock = `} else if (field.type === 'invoice_link') {
                    if (invoiceLinkType === "url") {
                      inputContent = (
                        <input 
                          value={(val || "").startsWith("app-invoice:") ? "" : (val || "")} 
                          onChange={(e) => setVal(e.target.value)} 
                          className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium" 
                          placeholder="https://drive.google.com/..." 
                          type="url" 
                        />
                      );
                    } else {
                      if (pastInvoices.length === 0) {
                        inputContent = (
                          <div className="w-full h-11 md:h-12 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-black/30 text-center text-xs text-neutral-500 font-body px-2 leading-tight">
                            No invoices. <span className="font-bold underline cursor-pointer ml-1" onClick={() => { closeModal(); navigate('/invoices'); }}>Create one.</span>
                          </div>
                        );
                      } else {
                        inputContent = (
                          <select
                            value={(val || "").startsWith("app-invoice:") ? val : \`app-invoice:\${pastInvoices[0]?.id || ""}\`}
                            onChange={(e) => setVal(e.target.value)}
                            className="w-full h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none font-body font-medium"
                          >
                            {pastInvoices.map((inv) => (
                              <option key={inv.id} value={\`app-invoice:\${inv.id}\`}>
                                Inv #{inv.invoiceNo} - {inv.billedToName}
                              </option>
                            ))}
                          </select>
                        );
                      }
                    }
                  }`;

const agreementLinkBlock = `} else if (field.type === 'agreement_link') {
                    if (agreementLinkType === "url") {
                      inputContent = (
                        <input 
                          value={(val || "").startsWith("app-agreement:") ? "" : (val || "")} 
                          onChange={(e) => setVal(e.target.value)} 
                          className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium" 
                          placeholder="https://drive.google.com/..." 
                          type="url" 
                        />
                      );
                    } else {
                      if (agreements.length === 0) {
                        inputContent = (
                          <div className="w-full h-11 md:h-12 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-black/30 text-center text-xs text-neutral-500 font-body px-2 leading-tight">
                            No agreements. <span className="font-bold underline cursor-pointer ml-1" onClick={() => { closeModal(); navigate('/agreements'); }}>Create one.</span>
                          </div>
                        );
                      } else {
                        inputContent = (
                          <select
                            value={(val || "").startsWith("app-agreement:") ? val : \`app-agreement:\${agreements[0]?.id || ""}\`}
                            onChange={(e) => setVal(e.target.value)}
                            className="w-full h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none font-body font-medium"
                          >
                            {agreements.map((agr) => (
                              <option key={agr.id} value={\`app-agreement:\${agr.id}\`}>
                                {agr.title} - {agr.clientName}
                              </option>
                            ))}
                          </select>
                        );
                      }
                    }
                  }`;

if (code.includes(invoiceLinkBlock)) {
    code = code.replace(invoiceLinkBlock, invoiceLinkBlock + "\n                  " + agreementLinkBlock);
} else {
    console.log("Could not find invoiceLinkBlock to inject agreementLinkBlock");
}

fs.writeFileSync(path, code);
