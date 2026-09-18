import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

# Add SignatureCanvas import
content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport SignatureCanvas from 'react-signature-canvas';")

# Add ref
content = content.replace("const pdfRef = useRef<HTMLDivElement>(null);", "const pdfRef = useRef<HTMLDivElement>(null);\n  const sigCanvas = useRef<SignatureCanvas>(null);")

# Update handleAgree
new_handle_agree = """  const handleAgree = async () => {
    if (!uid || !id) return;
    
    if (sigCanvas.current?.isEmpty()) {
      alert("Please draw your signature to accept the agreement.");
      return;
    }
    
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      setLoading(true);
      const docRef = doc(db, `users/${uid}/agreements/${id}`);
      await updateDoc(docRef, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        signature: signatureImage
      });
      setAgreement((prev: any) => ({ ...prev, signature: signatureImage }));
      setAccepted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to sign the agreement. Permissions issue.');
    } finally {
      setLoading(false);
    }
  };"""

content = re.sub(r"  const handleAgree = async \(\) => \{.*?\n  \};", new_handle_agree, content, flags=re.DOTALL)


# Update the bottom portion
bottom_portion = """          <div className="mt-12 pt-8 border-t-2 border-neutral-200">
            {accepted ? (
              <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 border-2 border-black border-dashed">
                <Check size={32} className="text-emerald-500 mb-2" />
                <p className="font-headline font-bold uppercase tracking-wide text-sm text-center">
                  Digitally Signed & Accepted
                </p>
                {agreement.signature && (
                  <img src={agreement.signature} alt="Client Signature" className="h-16 mt-4 mix-blend-multiply" />
                )}
                <p className="font-body text-xs text-neutral-500 font-medium mt-1">
                  On {new Date(agreement.acceptedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full">
                  <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-2">
                    Draw your signature
                  </label>
                  <div className="border-2 border-black bg-white w-full flex flex-col relative">
                    <SignatureCanvas 
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{ className: "w-full h-32 md:h-40 cursor-crosshair", style: { width: '100%', height: '100%' } }}
                    />
                    <div className="absolute bottom-2 right-2 flex justify-end">
                       <button onClick={() => sigCanvas.current?.clear()} className="px-2 py-1 bg-white border border-black text-[9px] font-headline font-bold uppercase text-black hover:bg-neutral-100 transition-colors">Clear</button>
                    </div>
                  </div>
                </div>
                <p className="font-headline font-bold text-sm text-center uppercase tracking-wide mt-4">
                  By signing below, you agree to the terms outlined in this document.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleAgree}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-4 bg-black text-white font-headline font-black uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Signing...' : 'I Agree & Sign'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-center w-full pt-6 border-t-2 border-neutral-100" data-html2canvas-ignore="true">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-black text-black font-headline font-black uppercase tracking-widest text-xs hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                {downloading ? 'Exporting PDF...' : 'Download PDF Copy'}
              </button>
            </div>
          </div>"""

content = re.sub(r'<div className="mt-12 pt-8 border-t-2 border-neutral-200">.*?</div>\n\s*</div>\n\s*</div>\n\s*</div>\n\s*\);\n\}', bottom_portion + '\n        </div>\n      </div>\n    </div>\n  );\n}', content, flags=re.DOTALL)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
