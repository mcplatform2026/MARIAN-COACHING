const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// Insert handleDownloadSaved
const downloadSavedStr = `
  const handleDownloadSaved = (invoice: SavedInvoice) => {
    // Save current active tab so we can go back
    const prevTab = activeTab;
    
    // Load invoice data into the form state to render the preview
    setCurrentInvoiceId(invoice.id);
    setLogoImage(invoice.logoImage);    
    setBrandNamePart1(invoice.brandNamePart1);
    setBrandNamePart2(invoice.brandNamePart2);
    setInvoiceTheme(invoice.invoiceTheme);
    setInvoiceTypography(invoice.invoiceTypography || "modern");
    setThankYouMessage(invoice.thankYouMessage || "THANK YOU FOR YOUR BUSINESS");
    setBilledToName(invoice.billedToName);
    setBilledToEmail(invoice.billedToEmail);
    setInvoiceDate(invoice.invoiceDate);
    setInvoiceNo(invoice.invoiceNo);
    setItems(invoice.items.map(it => ({ ...it })));
    setExactTerms(invoice.exactTerms);
    setPaymentDetails(invoice.paymentDetails || "");
    setSignatureName(invoice.signatureName);
    setSignatureWritten(invoice.signatureWritten);
    setSignatureFontClass(invoice.signatureFontClass);
    setSignatureImage(invoice.signatureImage || null);
    setSignatureImageScale(invoice.signatureImageScale ?? 100);
    setPhone(invoice.phone);
    setEmail(invoice.email);
    setWebsite(invoice.website);
    setCurrencySymbol(invoice.currencySymbol);
    setSubtextStyle(invoice.subtextStyle);
    
    // Switch to create tab temporarily so DOM is rendered
    setActiveTab("create");
    
    setTimeout(async () => {
      await handleDownloadPDF();
      // Switch back to original view immediately after snapshot
      setActiveTab(prevTab);
    }, 400);
  };
`;

code = code.replace('const handleLoadInvoice = (invoice: SavedInvoice) => {', downloadSavedStr + '\n  const handleLoadInvoice = (invoice: SavedInvoice) => {');

// Replace the action buttons
const oldButtons = `<div className="border-t-2 border-black pt-3 mt-4 flex gap-1.5 pr-3">
                          <button
                            onClick={() => handleLoadInvoice(inv)}
                            className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white font-headline font-bold text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-1 transition-all active:scale-95 animate-in"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDuplicateInvoice(inv, e)}
                            title="Duplicate this invoice"
                            className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 font-headline font-bold text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-1 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <button
                            onClick={(e) => handleDeleteInvoice(inv.id, e)}
                            title="Delete invoice permanently"
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-600/20 hover:border-red-600 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>`;

const newButtons = `<div className="border-t-2 border-black pt-3 mt-4 flex justify-between gap-1">
                          <button
                            onClick={(e) => handleDuplicateInvoice(inv, e)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Duplicate this invoice"
                          >
                            <Copy size={14} />
                          </button>
                          
                          <a 
                            href={"https://wa.me/?text=" + encodeURIComponent("Please find the attached invoice PDF.")}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold flex items-center justify-center"
                            title="Send via WhatsApp (Attach PDF manually)"
                            onClick={() => handleDownloadSaved(inv)}
                          >
                            <MessageCircle size={14} />
                          </a>
                          
                          <a 
                            href={"https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=" + encodeURIComponent("Invoice #" + inv.invoiceNo) + "&body=" + encodeURIComponent("Please find the attached invoice PDF.")}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="Send via Email (Attach PDF manually)"
                            onClick={() => handleDownloadSaved(inv)}
                          >
                            <Mail size={14} />
                          </a>

                          <button
                            onClick={() => handleDownloadSaved(inv)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            onClick={() => handleLoadInvoice(inv)}
                            className="p-1.5 bg-white hover:bg-blue-50 border-2 border-black transition-all hover:scale-105 text-blue-600"
                            title="Edit Invoice"
                          >
                            <PenTool size={14} />
                          </button>

                          <button
                            onClick={(e) => handleDeleteInvoice(inv.id, e)}
                            title="Delete invoice permanently"
                            className="p-1.5 bg-white hover:bg-red-50 border-2 border-black transition-all hover:scale-105 text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Patch complete.');
