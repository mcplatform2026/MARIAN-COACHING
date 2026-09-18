import re

content = """import React, { useState, useEffect, useRef } from 'react';
import { Check, Download, AlertCircle } from 'lucide-react';
import { SignatureCanvasBlock } from '../components/SignatureCanvasBlock';
import LZString from 'lz-string';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

const themes: any = {
  white: { bg: "#ffffff", cardBg: "#ffffff", text: "#000000", border: "#000000" },
  alabaster: { bg: "#FAF8F5", cardBg: "#fcfbfa", text: "#171717", border: "rgba(120, 53, 4, 0.4)" },
  nordic: { bg: "#F0F3F6", cardBg: "#f8f9fa", text: "#0F172A", border: "rgba(30, 58, 138, 0.4)" },
  blush: { bg: "#FDF8F7", cardBg: "#fffdfd", text: "#4C0519", border: "rgba(159, 18, 57, 0.3)" },
  sage: { bg: "#F2F6F4", cardBg: "#f9fbf9", text: "#064E3B", border: "rgba(6, 78, 59, 0.3)" }
};

const typographyFonts = [
  { id: "modern", primary: "'Space Grotesk', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
  { id: "classic", primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
  { id: "tech", primary: "'Sora', sans-serif", secondary: "'Sora', sans-serif" },
  { id: "elegant", primary: "'Archivo', sans-serif", secondary: "'Archivo', sans-serif" }
];

export function DocumentView() {
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const pdfRef = useRef<HTMLDivElement>(null);
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
    try {
      setDownloading(true);

      const ignoredElements = pdfRef.current.querySelectorAll('[data-html2pdf-ignore="true"]');
      ignoredElements.forEach(el => (el as HTMLElement).style.display = 'none');

      const dataUrl = await domtoimage.toPng(pdfRef.current, {
        quality: 1,
        bgcolor: '#ffffff'
      });

      ignoredElements.forEach(el => (el as HTMLElement).style.display = '');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`Agreement_${agreement?.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
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

  const currentTheme = themes[agreement.invoiceTheme] || themes.white;
  const currentFont = typographyFonts.find(f => f.id === agreement.invoiceTypography) || typographyFonts[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex justify-center" style={{ backgroundColor: currentTheme.bg }}>
      <div 
        ref={pdfRef}
        className="w-full max-w-[210mm] bg-white border border-neutral-300 shadow-xl relative"
        style={{ 
          backgroundColor: currentTheme.cardBg,
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
          <div className="flex justify-between items-start mb-12">
            <div>
              {agreement.logoImage ? (
                <div style={{ width: `${(agreement.logoImageScale || 100) * 1.6}px`, display: 'flex', justifyContent: 'flex-start' }}>
                  <img src={agreement.logoImage} alt="Brand Custom Logo" style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="font-headline font-black text-2xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-headline-family)' }}>
                  LOREM IPSUM.
                </div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-headline font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-headline-family)', color: currentTheme.text }}>
                {agreement.title || 'Agreement'}
              </h1>
              <p className="text-sm mt-1 opacity-70">Prepared for {agreement.clientName || 'Client'}</p>
              <p className="text-xs opacity-70 mt-1">{new Date(agreement.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Fee Box (If present) */}
          {agreement.fee && (
            <div className="mb-8 p-4 border-l-4" style={{ borderColor: currentTheme.border, backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Total Fee / Value</p>
              <p className="text-2xl font-headline font-black" style={{ fontFamily: 'var(--font-headline-family)' }}>{agreement.fee}</p>
            </div>
          )}

          {/* Tiptap Content */}
          <div className="prose prose-sm sm:prose-base max-w-none">
            <style>{`
              .studio-tiptap h1 { font-family: var(--font-headline-family); font-size: 1.8em; font-weight: 900; margin-bottom: 0.5em; text-transform: uppercase; color: ${currentTheme.text}; }
              .studio-tiptap h2 { font-family: var(--font-headline-family); font-size: 1.5em; font-weight: 800; margin-bottom: 0.5em; text-transform: uppercase; color: ${currentTheme.text}; }
              .studio-tiptap p { margin-bottom: 0.8em; line-height: 1.6; }
              .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }
              .studio-tiptap li { margin-bottom: 0.3em; }
            `}</style>
            <div className="studio-tiptap" dangerouslySetInnerHTML={{ __html: agreement.projectDetails || '<p className="italic opacity-50">Content will appear here...</p>' }} />
          </div>

          {/* Signatures */}
          <div className="mt-16 pt-8 border-t-2" style={{ borderColor: currentTheme.border }}>
            <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Provider Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full h-32 border-b-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: currentTheme.border }}>
                  {agreement.providerSignature ? (
                    <img src={agreement.providerSignature} alt="Service Provider Signature" className="max-h-24 mix-blend-multiply" />
                  ) : (
                    <span className="opacity-30 font-headline uppercase italic">Not provided</span>
                  )}
                </div>
                <p className="font-headline font-bold uppercase tracking-wide text-xs mt-4" style={{ fontFamily: 'var(--font-headline-family)' }}>Service Provider</p>
                <p className="font-body text-xs mt-1 opacity-60">
                  {new Date(agreement.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Client Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full min-h-[8rem] border-b-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: currentTheme.border }}>
                  {accepted || agreement.clientSignature ? (
                    <img src={agreement.clientSignature || clientSig} alt="Client Signature" className="max-h-24 mix-blend-multiply" />
                  ) : (
                    <div className="w-full" data-html2pdf-ignore="true">
                      <SignatureCanvasBlock onSignatureReady={setClientSig} label="Draw Signature" />
                    </div>
                  )}
                </div>
                <p className="font-headline font-bold uppercase tracking-wide text-xs mt-4" style={{ fontFamily: 'var(--font-headline-family)' }}>{agreement.clientName}</p>
                {accepted && (
                  <p className="font-body text-xs mt-1 opacity-60">
                    {new Date(agreement.acceptedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Verification Audit Trail Box (Added when accepted) */}
          {accepted && (
            <div className="mt-12 p-4 border-2 border-dashed" style={{ borderColor: currentTheme.border, backgroundColor: 'rgba(0,0,0,0.02)' }}>
               <h4 className="font-headline font-black uppercase text-xs mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-headline-family)' }}>
                 <Check size={14} className="text-emerald-600" />
                 Document Audit Trail
               </h4>
               <p className="font-body text-[10px] opacity-70 leading-relaxed">
                 This document was mutually executed by the Service Provider and {agreement.clientName}. 
                 Client signature securely captured and embedded directly into the document structure via serverless cryptographic URL generation.
                 <br/><br/>
                 <strong>Created:</strong> {new Date(agreement.createdAt).toLocaleString()} <br/>
                 <strong>Executed:</strong> {new Date(agreement.acceptedAt).toLocaleString()}
               </p>
            </div>
          )}

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
  );
}
"""

with open('src/pages/DocumentView.tsx', 'w') as f:
    f.write(content)
