import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

imports = """import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle2, Clock, Check, Download } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
"""

content = re.sub(r"import React.*?from 'lucide-react';", imports, content, flags=re.DOTALL)

# Add ref and download function
func = """  const [accepted, setAccepted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !agreement) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${agreement.clientName.replace(/\s+/g, '_')}_Agreement.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };
"""
content = content.replace("  const [accepted, setAccepted] = useState(false);", func)

# Add ref to main content div
content = content.replace('<div className="bg-white border-2 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">', '<div className="bg-white border-2 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative" ref={pdfRef}>')

# Add Download button next to Accept button
dl_btn = """              <div className="flex flex-col items-center gap-4 w-full">
                <p className="font-headline font-bold text-sm text-center uppercase tracking-wide">
                  By clicking below, you agree to the terms outlined in this document.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-black text-black font-headline font-black uppercase tracking-widest text-sm hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {downloading ? 'Exporting...' : 'Save PDF'}
                  </button>
                  <button
                    onClick={handleAgree}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-4 bg-black text-white font-headline font-black uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Signing...' : 'I Agree & Sign'}
                  </button>
                </div>
              </div>"""

content = re.sub(r'<div className="flex flex-col items-center gap-4">\n\s*<p className="font-headline font-bold text-sm text-center uppercase tracking-wide">\n\s*By clicking below.*?I Agree & Sign\'}\n\s*</button>\n\s*</div>', dl_btn, content, flags=re.DOTALL)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
