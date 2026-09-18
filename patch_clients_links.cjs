const fs = require('fs');
const path = 'src/pages/Clients.tsx';
let code = fs.readFileSync(path, 'utf8');

const linkRenderBlock = `if (field.type === 'invoice_link') {
                            const isApp = (val || "").startsWith("app-invoice:");
                            if (isApp) {
                              const invId = val.replace("app-invoice:", "");
                              return (
                                <div key={field.id} className="flex justify-between items-center border-b-2 border-black/10 py-2">
                                  <span className="font-headline font-bold text-xs uppercase tracking-wider">{field.label}</span>
                                  <button onClick={() => navigate('/invoices')} className="text-primary font-bold text-sm underline hover:opacity-80 flex items-center gap-1">
                                    <ExternalLink size={14} /> Open Invoice
                                  </button>
                                </div>
                              )
                            }
                          }`;

// Note: the original link code might be different. Let's find it first.
