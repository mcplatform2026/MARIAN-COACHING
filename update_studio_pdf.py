import re

with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

# 1. Add jsPDF and dom-to-image-more imports
import_insert = r"import { Lock, Unlock, Eye, Send, FileText, Check, Plus, Image as ImageIcon, PaintBucket, Type, Pilcrow, Bold, Italic, Strikethrough, Heading1, Heading2, List, Download, Palette, Building2, UserCircle, PenTool as PenToolIcon } from 'lucide-react';"

if "import jsPDF from 'jspdf';" not in content:
    content = content.replace(import_insert, import_insert + "\nimport jsPDF from 'jspdf';\nimport domtoimage from 'dom-to-image-more';")

# 2. Add Theme Lock state
theme_lock_states = """
  const [isThemeLocked, setIsThemeLocked] = useState(() => localStorage.getItem('agreementThemeLocked') === 'true');
  const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>(() => (localStorage.getItem('agreementTheme') as ThemeKey) || "white");
  const [invoiceTypography, setInvoiceTypography] = useState(() => localStorage.getItem('agreementTypography') || "modern");
  const [logoImageScale, setLogoImageScale] = useState(() => parseInt(localStorage.getItem('agreementLogoScale') || '100'));
  
  // Note: logoImage is too big for standard localStorage sometimes, but we can try if it's a small data URL.
  // Actually, we'll skip logoImage for now to prevent quota errors, or we can try it.
  const [logoImage, setLogoImage] = useState<string | null>(() => localStorage.getItem('agreementLogo') || null);

  useEffect(() => {
    if (isThemeLocked) {
      localStorage.setItem('agreementThemeLocked', 'true');
      localStorage.setItem('agreementTheme', invoiceTheme);
      localStorage.setItem('agreementTypography', invoiceTypography);
      localStorage.setItem('agreementLogoScale', logoImageScale.toString());
      if (logoImage) localStorage.setItem('agreementLogo', logoImage);
    } else {
      localStorage.removeItem('agreementThemeLocked');
      // don't remove the settings themselves so they stay if you unlock but don't change
    }
  }, [isThemeLocked, invoiceTheme, invoiceTypography, logoImageScale, logoImage]);
"""

# Replace old state initializations
content = re.sub(r'const \[logoImageScale, setLogoImageScale\] = useState\(100\);.*?const \[invoiceTypography, setInvoiceTypography\] = useState\("modern"\);', theme_lock_states, content, flags=re.DOTALL)
content = re.sub(r'const \[logoImage, setLogoImage\] = useState<string \| null>\(null\);', '', content)

# 3. Add handleDownloadPDF function
download_pdf_fn = """
  const [downloading, setDownloading] = useState(false);
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      setDownloading(true);
      const scale = 2; 
      const element = pdfRef.current;
      
      const canvas = await domtoimage.toCanvas(element, {
        quality: 1.0,
        scale: scale,
        width: element.clientWidth * scale,
        height: element.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${element.clientWidth}px`,
          height: `${element.clientHeight}px`,
          margin: '0',
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [element.clientWidth, element.clientHeight],
        hotfixes: ['px_scaling']
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, element.clientWidth, element.clientHeight);
      
      pdf.save(`Draft_Agreement_${formData.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
"""

# Insert handleDownloadPDF after handleDrop
content = re.sub(r'(const handleDrop = [\s\S]*?};)', r'\1\n' + download_pdf_fn, content)

# 4. Add Download PDF button to header
header_buttons = r'<button\s*onClick=\{onCancel\}.*?Cancel\s*</button>'
new_header_buttons = """<button 
            onClick={onCancel}
            className="px-4 py-2 text-neutral-500 hover:text-neutral-900 font-headline font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 border-2 border-black bg-white hover:bg-neutral-100 text-black font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:translate-y-0.5 disabled:opacity-50 disabled:active:translate-y-0"
          >
            <Download size={14} />
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>"""
content = re.sub(header_buttons, new_header_buttons, content)

# 5. Add Lock button to Branding & Theme section
branding_header = r'<h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2 mb-4">\s*<Palette className="w-4 h-4 text-purple-600" /> Logo & Styling\s*</h3>'
new_branding_header = """<div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" /> Branding & Theme
            </h3>
            <button
              onClick={() => setIsThemeLocked(!isThemeLocked)}
              className={`flex items-center gap-1.5 px-2 py-1 border-2 text-[10px] uppercase font-bold tracking-wider transition-all ${
                isThemeLocked ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-neutral-300 text-neutral-500 hover:border-black hover:text-black'
              }`}
              title={isThemeLocked ? "Settings locked for future agreements" : "Lock settings for future agreements"}
            >
              {isThemeLocked ? <Lock size={12} /> : <Unlock size={12} />}
              {isThemeLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>"""
content = re.sub(branding_header, new_branding_header, content)

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)
