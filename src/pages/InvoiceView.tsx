import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";
import { generateUniversalPDF } from "../utils/pdfGenerator";

const themes: Record<string, any> = {
  white: { bg: '#ffffff', text: '#000000', border: '#000000', rowSeparator: '#e5e5e5' },
  alabaster: { bg: '#FAFAF8', text: '#1A1A1A', border: '#1A1A1A', rowSeparator: '#e5e5e5' },
  nordic: { bg: '#F0F4F8', text: '#2D3748', border: '#2D3748', rowSeparator: '#cbd5e0' },
  sage: { bg: '#F4F5F0', text: '#2C3329', border: '#2C3329', rowSeparator: '#d1d5db' },
  classic: { bg: "#ffffff", text: "#171717", border: "#e5e5e5", accent: "#000000" },
  dark: { bg: "#0a0a0a", text: "#f5f5f5", border: "#262626", accent: "#ffffff" },
  warm: { bg: "#fdfbf7", text: "#2c2825", border: "#e8e1d9", accent: "#d4a373" },
  cool: { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0", accent: "#3b82f6" },
  neon: { bg: "#000000", text: "#ffffff", border: "#333333", accent: "#ccff00" },
};
export function InvoiceView() {
  const { uid, id } = useParams<{ uid: string; id: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        if (!uid && id) {
          // Very short link /i/:id
          const docRef = doc(db, "shared_links", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            if (docData.type === 'invoice' && docData.data) {
              setInvoice(docData.data);
            } else {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        } else {
          // Legacy links
          let docId = id;
          if (!id.startsWith('inv_')) {
            docId = 'inv_' + id;
          }
          
          let docRef = doc(db, "users/" + uid + "/agreements/" + docId);
          let docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            docRef = doc(db, "users/" + uid + "/invoices/" + id);
            try { docSnap = await getDoc(docRef); } catch (e) {}
          }
          
          if (docSnap.exists()) {
            setInvoice(docSnap.data());
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [uid, id]);

  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    
    try {
      const element = document.getElementById("invoice-capture-area");
      if (!element) return;
      
      const theme = invoice.invoiceTheme || "classic";
      const bg = themes[theme]?.bg || '#ffffff';
      const textCol = themes[theme]?.text || '#000000';
      const invoiceNoStr = invoice.invoiceNo || 'report';

      await generateUniversalPDF({
        element,
        filename: `invoice_${invoiceNoStr}.pdf`,
        widthPx: 794,
        minHeightPx: 1123,
        backgroundColor: bg,
        textColor: textCol,
        scale: 2,
        multiPage: false,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert("Failed to download PDF: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 font-body">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-neutral-600 animate-spin mb-4" />
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-neutral-500">
            Loading Invoice...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 font-body p-6">
        <div className="max-w-md w-full bg-white border-2 border-black p-8 text-center neu-shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="font-headline font-black text-xl uppercase tracking-wider mb-2">Invoice Not Found</h1>
          <p className="text-sm text-neutral-600 mb-6">
            The invoice you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const theme = invoice.invoiceTheme || "classic";
  const typography = invoice.invoiceTypography || "modern";
  const bg = themes[theme]?.bg || '#ffffff';
  const textCol = themes[theme]?.text || '#000000';
  const borderCol = themes[theme]?.border || '#e5e5e5';
  
  const totalAmount = (invoice.items || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const currencySymbol = invoice.currencySymbol || "$";

  const dynamicStyle = {
            borderColor: borderCol,
            backgroundColor: bg,
            color: textCol,
            '--font-headline-family': typography === 'modern' ? "'Space Grotesk', sans-serif" :
                                     typography === 'classic' ? "'Inter', sans-serif" :
                                     typography === 'tech' ? "'Sora', sans-serif" :
                                     "'Plus Jakarta Sans', sans-serif",
            '--font-body-family': typography === 'modern' ? "'Plus Jakarta Sans', sans-serif" :
                                 typography === 'classic' ? "'Lora', serif" :
                                 typography === 'tech' ? "'JetBrains Mono', monospace" :
                                 "'Inter', sans-serif",
            fontFamily: 'var(--font-body-family)'
  };
  
  const imgScale = (invoice.signatureImageScale || 100) / 100;

  return (
    <div className="min-h-screen bg-white font-body flex flex-col items-center">
      
      {/* Top Action Bar */}
      <div className="w-full bg-white border-b border-neutral-200 p-4 sticky top-0 z-50 shadow-sm flex items-center justify-between lg:px-12">
        <div className="font-headline font-black text-sm uppercase tracking-widest flex items-center gap-2">
          {invoice.logoImage ? "INVOICE DOCUMENT" : (invoice.brandNamePart1 === "LOREM" ? "INVOICE DOCUMENT" : <>{invoice.brandNamePart1} <span className="text-neutral-400">{invoice.brandNamePart2}</span></>)}
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-4 py-2 bg-black text-white font-headline font-bold text-xs uppercase tracking-widest border-2 border-black flex items-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div className="w-full max-w-[850px] p-0 md:p-8 overflow-x-auto mx-auto flex-1 flex flex-col">
        <div 
          id="invoice-capture-area"
          className="mx-auto px-6 md:px-12 pt-8 pb-8 w-full max-w-[794px] min-h-[1123px] shrink-0 flex-1 flex flex-col justify-between transition-colors duration-150 relative overflow-hidden bg-white"
          style={dynamicStyle as React.CSSProperties}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex-1">
              {invoice.logoImage ? (
                <div style={{ width: `${Math.round(160 * ((invoice.logoImageScale || 100) / 100))}px`, maxWidth: '320px', display: "flex", justifyContent: "flex-start" }}>
                  <img 
                    src={invoice.logoImage} 
                    alt="Brand Logo" 
                    className="mb-4" 
                    style={{ 
                      maxHeight: `${Math.round(64 * ((invoice.logoImageScale || 100) / 100))}px`,
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
              ) : (
                <div className="h-16 flex items-center font-headline font-black text-2xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-headline-family)' }}>
                  {invoice.brandNamePart1} <span className="opacity-50 ml-1.5">{invoice.brandNamePart2}</span>
                </div>
              )}
            </div>
            
            <div className="text-right border-l-2 pl-6" style={{ borderColor: borderCol }}>
              <h2 className="font-headline font-black text-4xl uppercase tracking-tighter leading-none mb-2" style={{ fontFamily: 'var(--font-headline-family)' }}>
                INVOICE
              </h2>
              <div className="font-headline font-bold text-sm tracking-widest opacity-60">
                #{invoice.invoiceNo}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="font-headline font-bold text-[10px] uppercase tracking-widest opacity-50 mb-2">Billed To</h3>
              <p className="font-headline font-black text-base uppercase leading-tight">
                {invoice.billedToName || 'Client Name'}
              </p>
              <p className="text-sm opacity-70 mt-1">
                {invoice.billedToEmail || 'client@email.com'}
              </p>
            </div>
            
            <div className="text-right">
              <h3 className="font-headline font-bold text-[10px] uppercase tracking-widest opacity-50 mb-2">Invoice Date</h3>
              <p className="font-headline font-bold text-sm">
                {invoice.invoiceDate ? formatDateToMMDDYYYY(invoice.invoiceDate) : 'Date not set'}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 font-headline font-bold text-[10px] uppercase tracking-widest opacity-50" style={{ borderColor: borderCol }}>
              <div className="col-span-8">Description</div>
              <div className="col-span-4 text-right">Amount</div>
            </div>
            
            <div className="mt-4 space-y-4">
              {(invoice.items || []).map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 items-start group">
                  <div className="col-span-8">
                    <p className="font-bold text-sm">{item.name || 'Item Name'}</p>
                    {item.description && (
                      <p className="text-xs opacity-60 mt-0.5 leading-relaxed pr-6">{item.description}</p>
                    )}
                  </div>
                  <div className="col-span-4 text-right font-headline font-bold text-sm">
                    {currencySymbol}{item.price || '0'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Payment Details */}
          <div className="grid grid-cols-2 gap-12 pt-8 border-t-2" style={{ borderColor: borderCol }}>
            <div>
              <h3 className="font-headline font-bold text-[10px] uppercase tracking-widest opacity-50 mb-2">Payment Details</h3>
              <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-80 font-medium">
                {invoice.paymentDetails || 'No payment details provided.'}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-headline font-bold text-[10px] uppercase tracking-widest opacity-50">Subtotal</span>
                <span className="font-bold text-sm">{currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: borderCol }}>
                <span className="font-headline font-black text-sm uppercase tracking-widest">Total Due</span>
                <span className="font-headline font-black text-xl">{currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 flex flex-col items-center" style={{ borderColor: borderCol }}>
            <h4 className="font-headline font-black text-lg uppercase tracking-widest mb-6 text-center">
              {invoice.thankYouMessage || 'THANK YOU FOR YOUR BUSINESS'}
            </h4>
            
            <div className="flex flex-col items-center gap-1 mb-10 w-full max-w-[280px]">
              <div className="w-full flex justify-center mb-1 h-14 relative">
                {invoice.signatureImage ? (
                  <img 
                    src={invoice.signatureImage} 
                    alt="Signature" 
                    className="max-h-full object-contain mix-blend-multiply filter grayscale opacity-90"
                    style={{ transform: "scale(" + imgScale + ")" }}
                  />
                ) : invoice.signatureWritten ? (
                  <span 
                    className={"text-neutral-800 -rotate-2 origin-center inline-block " + (invoice.signatureFontClass || 'font-writing-1')} 
                    style={{ 
                      fontSize: `${Math.round(30 * imgScale)}px`,
                      fontFamily: 'var(--font-headline-family)' 
                    }}
                  >
                    {invoice.signatureWritten}
                  </span>
                ) : null}
              </div>
              <div className="w-full h-px bg-black/20"></div>
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest opacity-40 mt-1">
                {invoice.signatureName || 'Authorized Signature'}
              </span>
            </div>
            
            <div id="footer-contact-row" className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full mx-auto font-bold font-headline uppercase tracking-wide" style={{ color: "#262626", fontSize: "13px" }}>
              {invoice.phone && <span className="flex items-center gap-1.5 whitespace-nowrap">{invoice.phone}</span>}
              {invoice.email && <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">{invoice.email}</span>}
              {invoice.website && <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">{invoice.website}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
