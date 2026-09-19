import React, { useState, useEffect, useRef } from 'react';
import { Check, Download, AlertCircle } from 'lucide-react';
import { SignatureCanvasBlock } from '../components/SignatureCanvasBlock';
import LZString from 'lz-string';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas-pro";
import html2pdf from "html2pdf.js";
import { formatDateToMMDDYYYY } from '../utils/dateFormat';

const themes: any = {
  white: { bg: "#ffffff", cardBg: "#ffffff", text: "#000000", border: "#000000" },
  alabaster: { bg: "#FAF8F5", cardBg: "#fcfbfa", text: "#171717", border: "rgba(120, 53, 4, 0.4)" },
  nordic: { bg: "#F0F3F6", cardBg: "#f8f9fa", text: "#0F172A", border: "rgba(30, 58, 138, 0.4)" },
  sage: { bg: "#F2F6F4", cardBg: "#f9fbf9", text: "#064E3B", border: "rgba(6, 78, 59, 0.3)" }
};

const typographyFonts = [
  { id: "modern", primary: "'Space Grotesk', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
  { id: "classic", primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
  { id: "tech", primary: "'Sora', sans-serif", secondary: "'Sora', sans-serif" },
  { id: "elegant", primary: "'Plus Jakarta Sans', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" }
];

export function DocumentView() {
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const pdfRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 32; // 16px padding each side
        if (containerWidth < 794) {
          setPreviewScale(containerWidth / 794);
        } else {
          setPreviewScale(1);
        }
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const [clientSig, setClientSig] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgreement = () => {
      try {
        if (!window.location.hash.startsWith('#data=')) {
          throw new Error("No document data found in URL.");
        }
        const encoded = window.location.hash.substring(6);
        const decodedStr = LZString.decompressFromEncodedURIComponent(encoded);
        if (!decodedStr) { 
          throw new Error("Failed to decompress document data.");
        }
        const parsedData = JSON.parse(decodedStr);
        setAgreement(parsedData);
        
        if (parsedData.status === 'accepted') {
          setAccepted(true);
        }
        setLoading(false);
      } catch (e: any) {
        console.error("Failed to decode zero-cost URL data", e);
        setError(e.message || "Invalid or corrupted document link.");
        setLoading(false);
      }
    };

    fetchAgreement();
  }, []);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);

    const element = pdfRef.current;
    
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "794px"; // Standard A4 width in px at 96 DPI
    container.style.overflow = "visible"; 
    container.style.boxSizing = "border-box";
    
    try {
      if (!element) return;
      
      const clone = element.cloneNode(true) as HTMLDivElement;
      clone.style.width = "794px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none"; 
      clone.style.borderRadius = "0";
      clone.style.display = "flex";
      clone.style.flexDirection = "column"; 
      clone.style.visibility = "visible";
      clone.style.boxSizing = "border-box";
      clone.style.padding = "0 40px";
    clone.style.border = "none"; // Content padding
      clone.style.backgroundColor = currentTheme?.bg || '#ffffff';
      clone.style.color = currentTheme?.text || '#000000';
      
      // Hide ignored elements
    const ignoreElements = clone.querySelectorAll('[data-html2pdf-ignore="true"], .no-print');
    ignoreElements.forEach(el => el.remove());
    
    container.appendChild(clone);
      document.body.appendChild(container);
      
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));
      

      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));
      
      const pageHeightPx = 1123; // standard A4 height at 794px width
      // Using html2pdf for proper margins and page breaks
      const opt = {
        margin: [20, 0] as [number, number], // top, left, bottom, right in mm
        filename:     `Agreement_${agreement?.clientName || 'Document'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: currentTheme?.bg || '#ffffff', windowWidth: 794, width: 794 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['p', 'li', 'h1', 'h2', 'h3', '.signatures-block', '.header-block', 'img'] }
      };
      
      await html2pdf().from(clone).set(opt).save();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(`Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setDownloading(false);
    }
  };


  const handleAgree = () => {
    if (!clientSig && !agreement.clientSignature) {
      alert("Please provide your signature to accept the agreement.");
      return;
    }
    
    // In serverless mode, we just update the URL hash
    const updatedAgreement = {
      ...agreement,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      clientSignature: clientSig || agreement.clientSignature
    };
    
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(updatedAgreement));
    window.location.hash = `#data=${encoded}`;
    
    setAgreement(updatedAgreement);
    setAccepted(true);
    
    // Auto-trigger PDF download as requested
    setTimeout(() => {
      handleDownloadPDF();
    }, 500);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">Decrypting Document...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100">
        <div className="bg-white border-2 border-red-500 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-red-700 font-headline font-black uppercase text-xl mb-2">Decryption Error</h2>
          <p className="text-neutral-600 font-body text-sm font-medium leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  const currentTheme = themes.white;
  const currentFont = typographyFonts.find(f => f.id === agreement.invoiceTypography) || typographyFonts[0];

  return (
    <div ref={previewContainerRef} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex sm:justify-center overflow-x-hidden" style={{ backgroundColor: currentTheme.bg }}>
      <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top center", width: "794px", display: "flex", flexDirection: "column", marginBottom: `-${(1 - previewScale) * (pdfRef.current?.offsetHeight || 1123)}px` }}>
      <div 
        ref={pdfRef}
        className="w-[210mm] shrink-0 bg-white border border-neutral-300 shadow-xl relative"
        style={{ 
          backgroundColor: currentTheme.bg,
          minHeight: '297mm',
          padding: '20mm',
          color: currentTheme.text,
          '--font-headline-family': currentFont.primary,
          '--font-body-family': currentFont.secondary,
        } as React.CSSProperties}
      >
        {accepted && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 border-2 border-emerald-600 rounded-full font-headline font-bold uppercase text-[10px]" data-html2pdf-ignore="true">
            <Check size={14} /> Accepted
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-body-family)' }}>
          
          {/* Header */}
              <div className="flex justify-between items-start mb-8 header-block">
                <div>
                  {agreement.logoImage ? (
                    <div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>
                      <img src={agreement.logoImage} alt="Brand Custom Logo" style={{ maxHeight: '56px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="font-headline font-black text-2xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      {agreement.brandColor ? <span style={{ color: agreement.brandColor }}>LOREM</span> : "LOREM"} IPSUM.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right" style={{ fontFamily: 'var(--font-headline-family)', color: currentTheme.text }}>
                    {agreement.title || 'Agreement'}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">Prepared for {agreement.clientName || 'Client'}</p>
                  {agreement.clientEmail && <p className="text-sm mt-1 opacity-80">{agreement.clientEmail}</p>}
                  <p className="text-xs opacity-70 mt-1">{formatDateToMMDDYYYY(agreement.createdAt || Date.now())}</p>
                  {agreement.fee && <p className="text-sm mt-2 font-bold uppercase tracking-wider opacity-90">Total Fee: {agreement.fee}</p>}
                </div>
              </div>

          {/* Tiptap Content */}
          <div className="prose prose-sm sm:prose-base max-w-none">
            <style>{`
                  .studio-tiptap { display: block; }
                  .studio-tiptap p, .studio-tiptap li { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.25em 0 !important;
                  }
                  .header-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: flex !important;
                  }
                  .signatures-block { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    display: flex !important;
                    flex-direction: column !important;
                  }
                  .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap h3 { 
                    page-break-after: avoid !important; 
                    break-after: avoid !important; 
                    page-break-inside: avoid !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0.5em 0 !important;
                  }
                  .studio-tiptap h1 { font-family: var(--font-headline-family); font-size: 1.8em; font-weight: 900; text-transform: uppercase; color: ${currentTheme.text}; }
                  .studio-tiptap h2 { font-family: var(--font-headline-family); font-size: 1.5em; font-weight: 800; text-transform: uppercase; color: ${currentTheme.text}; }
                  .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0 !important; padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
                `}</style>
            <div className="studio-tiptap" dangerouslySetInnerHTML={{ __html: agreement.projectDetails || '<p className="italic opacity-50">Content will appear here...</p>' }} />
          </div>

          {/* Signatures */}
          <div className="mt-16 pt-8 border-t-2" style={{ borderColor: currentTheme.border }}>
            <div className="flex flex-row gap-12 w-full">
              
              {/* Provider Signature */}
              <div className="flex-1 w-1/2 flex flex-col items-center">
                <div className="w-full h-32 border-b-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: currentTheme.border }}>
                  {agreement.providerSignature ? (
                    <img src={agreement.providerSignature} alt="Service Provider Signature" className="max-h-24 max-w-full object-contain mix-blend-multiply" />
                  ) : (
                    <span className="opacity-30 font-headline uppercase italic">Not provided</span>
                  )}
                </div>
                <p className="font-headline font-bold uppercase tracking-wide text-xs mt-4" style={{ fontFamily: 'var(--font-headline-family)' }}>{agreement.providerSignatureLabel || 'Service Provider Name'}</p>
                <p className="font-body text-xs mt-1 opacity-60">
                  {new Date(agreement.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>

              {/* Client Signature */}
              <div className="flex-1 w-1/2 flex flex-col items-center">
                <div className="w-full min-h-[8rem] border-b-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: currentTheme.border }}>
                  {accepted || agreement.clientSignature ? (
                    <img src={agreement.clientSignature || clientSig} alt="Client Signature" className="max-h-24 max-w-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="w-full" data-html2pdf-ignore="true">
                      <SignatureCanvasBlock onSignatureReady={setClientSig} label="Draw Signature" />
                    </div>
                  )}
                </div>
                <p className="font-headline font-bold uppercase tracking-wide text-xs mt-4" style={{ fontFamily: 'var(--font-headline-family)' }}>{agreement.clientName}</p>
                {accepted && (
                  <p className="font-body text-xs mt-1 opacity-60">
                    {new Date(agreement.acceptedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          

        </div>
        
        {/* Actions - Hidden from PDF */}
        <div className="mt-8 flex justify-center w-full pt-6 border-t-2" style={{ borderColor: currentTheme.border }} data-html2pdf-ignore="true">
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
  </div>
  </div>
  );
}
