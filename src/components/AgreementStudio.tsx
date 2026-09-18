import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import html2pdf from "html2pdf.js";
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

import { Extension } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

import { SignatureCanvasBlock } from './SignatureCanvasBlock';
import { 
  Palette, Building2, UserCircle, PenTool as PenToolIcon, Lock, Unlock, Type, FileText, Check, Upload, 
  Bold, Italic, Strikethrough, Heading1, Heading2, List, Pilcrow,
  Save, RefreshCw, X, Download, PenTool, ArrowLeft, Eye
} from 'lucide-react';

type ThemeKey = "white" | "alabaster" | "nordic" | "sage";
const themes = {
  white: { bg: "#ffffff", cardBg: "#ffffff", text: "#000000", border: "#000000" },
  alabaster: { bg: "#FAF8F5", cardBg: "#fcfbfa", text: "#171717", border: "rgba(120, 53, 4, 0.4)" },
  nordic: { bg: "#F0F3F6", cardBg: "#f8f9fa", text: "#0F172A", border: "rgba(30, 58, 138, 0.4)" },
  sage: { bg: "#F2F6F4", cardBg: "#f9fbf9", text: "#064E3B", border: "rgba(6, 78, 59, 0.3)" }
};

export function AgreementStudio({ onCancel, onCreate, brandColor, templates, initialData }: any) {
  const [isContentLocked, setIsContentLocked] = useState(() => localStorage.getItem('agreementContentLocked') === 'true');
  const [isSignaturesLocked, setIsSignaturesLocked] = useState(() => localStorage.getItem('agreementSignaturesLocked') === 'true');
  const [formData, setFormData] = useState(() => {
    // Check if it's a new agreement (not editing an existing one)
    const isNew = initialData.title === 'Client Agreement' && initialData.projectDetails === '<p>Project scope details here...</p>';
    if (isNew && localStorage.getItem('agreementContentLocked') === 'true') {
      const savedContent = localStorage.getItem('defaultAgreementContent');
      if (savedContent) {
        return { ...initialData, projectDetails: savedContent };
      }
    }
    return initialData;
  });
  
  const initialProviderSig = localStorage.getItem('agreementProviderSig') || null;
  const [providerSig, setProviderSig] = useState<string | null>(initialProviderSig);

  useEffect(() => {
    if (isContentLocked) {
      localStorage.setItem('defaultAgreementContent', formData.projectDetails);
    }
  }, [formData.projectDetails, isContentLocked]);

  useEffect(() => {
    if (isSignaturesLocked) {
      if (providerSig) localStorage.setItem('agreementProviderSig', providerSig);
      else localStorage.removeItem('agreementProviderSig');
      if (formData.providerSignatureLabel) {
        localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
      }
    }
  }, [providerSig, isSignaturesLocked, formData.providerSignatureLabel]);

  useEffect(() => {
    const savedName = localStorage.getItem('defaultProviderName');
    if (savedName && (!formData.providerSignatureLabel || formData.providerSignatureLabel === 'Service Provider Name')) {
      setFormData(prev => ({ ...prev, providerSignatureLabel: savedName }));
    }
  }, []);

  const handleSaveDefaultSignature = (signature: string) => {
    localStorage.setItem('agreementProviderSig', signature);
    if (formData.providerSignatureLabel) {
      localStorage.setItem('defaultProviderName', formData.providerSignatureLabel);
    }
    alert('Name and Signature saved as default! They will auto-load for future agreements.');
  };


  const [clientSig, setClientSig] = useState<string | null>(null);
  
  
  
  const [isThemeLocked, setIsThemeLocked] = useState(() => localStorage.getItem('agreementThemeLocked') === 'true');
  const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>(() => (localStorage.getItem('agreementTheme') as ThemeKey) || "white");
  const [invoiceTypography, setInvoiceTypography] = useState(() => localStorage.getItem('agreementTypography') || "modern");
  
  
  // Note: logoImage is too big for standard localStorage sometimes, but we can try if it's a small data URL.
  // Actually, we'll skip logoImage for now to prevent quota errors, or we can try it.
  const [logoImage, setLogoImage] = useState<string | null>(() => localStorage.getItem('agreementLogo') || null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const data = localStorage.getItem('agreementLogo');
      if (data !== null) setLogoImage(data);
    };
    window.addEventListener("agreementLogoChange", handleSync);
    return () => window.removeEventListener("agreementLogoChange", handleSync);
  }, []);

  useEffect(() => {
    if (isThemeLocked) {
      localStorage.setItem('agreementThemeLocked', 'true');
      localStorage.setItem('agreementTheme', invoiceTheme);
      localStorage.setItem('agreementTypography', invoiceTypography);
      if (logoImage) { localStorage.setItem('agreementLogo', logoImage); window.dispatchEvent(new Event("agreementLogoChange")); }
    } else {
      localStorage.removeItem('agreementThemeLocked');
      // don't remove the settings themselves so they stay if you unlock but don't change
    }
  }, [isThemeLocked, invoiceTheme, invoiceTypography, logoImage]);

  

  
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 32; // p-4 is 16px each side = 32px
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


  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],
    content: formData.projectDetails,
    onUpdate: ({ editor }) => {
      setFormData((prev: any) => ({ ...prev, projectDetails: editor.getHTML() }));
    },
  });

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const [downloading, setDownloading] = useState(false);
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
    
    const clone = element.cloneNode(true) as HTMLDivElement;
    clone.style.width = "794px";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none"; 
    clone.style.borderRadius = "0";
    clone.style.display = "block"; 
    clone.style.visibility = "visible";
    clone.style.boxSizing = "border-box";
    clone.style.padding = "0 40px";
    clone.style.border = "none"; // Content padding
    clone.style.backgroundColor = themes.white?.bg || '#ffffff';
    clone.style.color = themes.white?.text || '#000000';
    
    // Hide ignored elements
    const ignoreElements = clone.querySelectorAll('[data-html2pdf-ignore="true"], .no-print');
    ignoreElements.forEach(el => el.remove());
    
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));
      

      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));
      
      const pageHeightPx = 1123; // standard A4 height at 794px width
      // Using html2pdf for proper margins and page breaks
      const opt = {
        margin: [20, 0] as [number, number], // top, left, bottom, right in mm
        filename:     `Agreement_${formData?.clientName || 'Document'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: themes.white?.bg || '#ffffff', windowWidth: 794, width: 794 },
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



  const handleLogoFile = (file: File) => {
    if (file.size > 250 * 1024) { alert("Logo is too large. Please upload an image smaller than 250KB to ensure smooth saving."); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      logoImage,
      invoiceTheme,
      invoiceTypography,
      providerSignature: providerSig,
      clientSignature: clientSig, // passing this if they filled it!
    };
    onCreate(finalData, isDraft, providerSig || undefined);
  };

  const typographyFonts = [
    { id: "modern", name: "Modern (Space Grotesk)", primary: "'Space Grotesk', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
    { id: "classic", name: "Classic (Inter)", primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { id: "minimal", name: "Minimal (Plus Jakarta)", primary: "'Plus Jakarta Sans', sans-serif", secondary: "'Plus Jakarta Sans', sans-serif" },
    { id: "tech", name: "Tech (Sora)", primary: "'Sora', sans-serif", secondary: "'Sora', sans-serif" }
  ];

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarState, setToolbarState] = useState<{
    isSticky: boolean;
    top: number;
    left: number;
    width: number;
    height: number;
    translateY: number;
  }>({
    isSticky: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    translateY: 0
  });

  useEffect(() => {
    const handleScrollAndResize = () => {
      if (!editorContainerRef.current) return;
      const containerRect = editorContainerRef.current.getBoundingClientRect();
      const toolbarHeight = toolbarRef.current?.offsetHeight || 46;
      
      const mobileHeader = document.querySelector('.lg\\:hidden.sticky') as HTMLElement | null;
      const topOffset = (window.innerWidth < 1024 && mobileHeader) 
        ? Math.max(0, mobileHeader.getBoundingClientRect().bottom) 
        : 0;

      const hasPassedTop = containerRect.top <= topOffset;
      const isBeforeBottom = containerRect.bottom > topOffset;

      if (hasPassedTop && isBeforeBottom) {
        const remainingSpace = containerRect.bottom - topOffset;
        const translateY = remainingSpace < toolbarHeight ? remainingSpace - toolbarHeight : 0;

        setToolbarState({
          isSticky: true,
          top: topOffset,
          left: containerRect.left,
          width: containerRect.width,
          height: toolbarHeight,
          translateY
        });
      } else {
        setToolbarState(prev => prev.isSticky ? { ...prev, isSticky: false, translateY: 0 } : prev);
      }
    };

    window.addEventListener('scroll', handleScrollAndResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollAndResize);

    const resizeObserver = new ResizeObserver(() => {
      handleScrollAndResize();
    });
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    handleScrollAndResize();

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize, { capture: true });
      window.removeEventListener('resize', handleScrollAndResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`.tiptap-editor { font-family: var(--font-body-family) !important; } .tiptap-editor h1, .tiptap-editor h2 { font-family: var(--font-headline-family) !important; text-transform: uppercase; font-weight: 800; }`}</style>
      <div className="flex flex-col lg:flex-row gap-6 h-full w-full agreement-studio-wrapper"
        style={{
          '--font-headline-family': invoiceTypography === 'modern' ? "'Space Grotesk', sans-serif" :
                                   invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                                   invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                                   "'Plus Jakarta Sans', sans-serif",
          '--font-body-family': invoiceTypography === 'modern' ? "'Plus Jakarta Sans', sans-serif" :
                               invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                               invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                               "'Plus Jakarta Sans', sans-serif"
        } as React.CSSProperties}
      >
      {/* LEFT PANEL - CONTROLS */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        <div className="flex items-center mb-0">
          <button 
            onClick={onCancel} 
            className="px-3.5 py-2.5 border-2 border-black bg-white text-neutral-950 hover:bg-neutral-100 font-headline font-bold text-xs flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 transition-all neu-shadow-sm shrink-0 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO AGREEMENTS
          </button>
        </div>

        {/* Global Settings */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none space-y-4">
          <div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-black" /> Branding & Theme
            </h3>
            <button
              onClick={() => setIsThemeLocked(!isThemeLocked)}
              className={`flex items-center justify-center p-1.5 border-2 border-black transition-all ${
                isThemeLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'
              }`}
              title={isThemeLocked ? "Settings locked for future agreements" : "Lock settings for future agreements"}
            >
              {isThemeLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {typographyFonts.map((font) => (
              <button
                key={font.id}
                onClick={() => setInvoiceTypography(font.id)}
                className={`p-2 border-2 text-left font-headline font-bold text-xs transition-all ${
                  invoiceTypography === font.id ? 'border-black bg-neutral-900 text-white shadow-sm' : 'border-black/20 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                }`}
                style={{ fontFamily: font.primary }}
              >
                <span className="block truncate">{font.name}</span>
                <span className="text-[9px] font-medium opacity-70 truncate block mt-0.5" style={{ fontFamily: font.secondary }}>Subtext Preview</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4">
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Custom Logo
            </label>
            <div 
              className={`w-full border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                logoImage ? "border-green-500 bg-green-50/10" : dragActive ? "border-blue-600 bg-blue-50/20" : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
              }`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input type="file" id="logoUpload" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleLogoFile(e.target.files[0])} />
              <label htmlFor="logoUpload" className="cursor-pointer w-full flex flex-col items-center gap-2">
                {!logoImage && <Upload className="w-6 h-6 text-neutral-400" />}
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">{logoImage ? "Change Logo" : "Drop logo here or click"}</p>
              </label>
              
              {logoImage && (
                <div className="flex flex-col w-full gap-2 mt-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-20 h-10 border border-neutral-300 overflow-hidden flex items-center justify-center p-1 bg-white">
                      <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                  
                  <button onClick={(e) => { e.preventDefault(); setLogoImage(null); }} className="text-[10px] text-red-600 font-bold uppercase hover:underline mt-1">Remove Logo</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-black" /> Agreement Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">Agreement Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-sm p-2 border-2 border-black focus:outline-none" placeholder="e.g. Website Redesign" />
            </div>
            <div>
              <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">Fee / Amount</label>
              <input type="text" value={formData.fee || ''} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="w-full text-sm p-2 border-2 border-black focus:outline-none" placeholder="$0.00" />
            </div>
            <div>
              <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">Client Name</label>
              <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full text-sm p-2 border-2 border-black focus:outline-none" placeholder="Client Name" />
            </div>
            <div>
              <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">Client Email</label>
              <input type="email" value={formData.clientEmail} onChange={(e) => setFormData({...formData, clientEmail: e.target.value})} className="w-full text-sm p-2 border-2 border-black focus:outline-none" placeholder="Client Email" />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-black" /> Project Scope & Content
            </h3>
            <button
              onClick={() => {
                const newLock = !isContentLocked;
                setIsContentLocked(newLock);
                localStorage.setItem('agreementContentLocked', String(newLock));
              }}
              className={`p-1.5 border-2 border-black transition-colors ${isContentLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
              title={isContentLocked ? "Unlock Content Settings" : "Lock Content Settings (Applies to new agreements)"}
            >
              {isContentLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div ref={editorContainerRef} className="border-2 border-black bg-white flex flex-col min-h-[650px] relative">
            {/* Placeholder to prevent layout shift when toolbar is sticky */}
            {toolbarState.isSticky && (
              <div style={{ height: toolbarState.height }} className="shrink-0" />
            )}
            <div 
              ref={toolbarRef}
              className={`flex flex-wrap items-center gap-1 p-2 border-b-2 border-black bg-neutral-50 ${
                toolbarState.isSticky ? 'fixed border-x-2 border-t-0 shadow-md z-30' : 'sticky top-0 z-10 w-full'
              }`}
              style={
                toolbarState.isSticky
                  ? {
                      top: `${toolbarState.top}px`,
                      left: `${toolbarState.left}px`,
                      width: `${toolbarState.width}px`,
                      transform: toolbarState.translateY ? `translateY(${toolbarState.translateY}px)` : undefined,
                    }
                  : undefined
              }
            >
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().setParagraph().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('paragraph') ? 'bg-neutral-200' : ''}`}><Pilcrow size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bold') ? 'bg-neutral-200' : ''}`}><Bold size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('italic') ? 'bg-neutral-200' : ''}`}><Italic size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('strike') ? 'bg-neutral-200' : ''}`}><Strikethrough size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-neutral-200' : ''}`}><Heading1 size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : ''}`}><Heading2 size={14}/></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bulletList') ? 'bg-neutral-200' : ''}`}><List size={14}/></button>
              <input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle')?.color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    editor?.chain().focus().setFontSize(e.target.value).run();
                  } else {
                    editor?.chain().focus().unsetFontSize().run();
                  }
                }}
                className="h-8 border-2 border-black bg-white text-xs font-bold px-1 ml-1 cursor-pointer outline-none"
                value={editor?.getAttributes('textStyle')?.fontSize || ''}
              >
                <option value="">Size</option>
                {Array.from({ length: 29 }, (_, i) => 8 + i * 2).map((size) => (
                  <option key={size} value={`${size}px`}>{size}px</option>
                ))}
              </select>
            </div>
            <EditorContent editor={editor} className="p-4 min-h-[600px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
          </div>
        </div>

        {/* SIGNATURE CONFIGURATION */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-black" /> Signature Configuration
            </h3>
            <button
              onClick={() => setIsSignaturesLocked(!isSignaturesLocked)}
              className={`p-1.5 border-2 border-black transition-colors ${isSignaturesLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
              title={isSignaturesLocked ? "Unlock Signature Settings" : "Lock Signature Settings"}
            >
              {isSignaturesLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="border-2 border-black p-4 bg-white relative">
              <input 
                type="text" 
                value={formData.providerSignatureLabel || ''} 
                onChange={(e) => setFormData({...formData, providerSignatureLabel: e.target.value})} 
                className="w-full text-xs font-bold uppercase tracking-wide p-2 border-2 border-black mb-4 focus:outline-none bg-white" 
                placeholder="Service Provider Name" 
              />
              <SignatureCanvasBlock
                label="Service Provider Name"
                initialSignature={providerSig}
                onSignatureReady={setProviderSig}
                showSaveDefault={true}
                onSaveDefault={handleSaveDefaultSignature}
              />
            </div>
            
            <div className="border-2 border-black p-4 bg-white relative">
              <input 
                type="text" 
                value={formData.clientName || ''} 
                onChange={(e) => setFormData({...formData, clientName: e.target.value})} 
                className="w-full text-xs font-bold uppercase tracking-wide p-2 border-2 border-black mb-4 focus:outline-none bg-white" 
                placeholder="Client Name" 
              />
              <SignatureCanvasBlock
                label="Client Name"
                initialSignature={clientSig}
                onSignatureReady={setClientSig}
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="flex gap-4 sticky bottom-0 bg-neutral-50 p-4 border-2 border-black z-10 mt-auto shadow-2xl">
          <button 
            onClick={(e) => handleSubmit(e, true)} 
            className="flex-1 border-2 border-black text-white font-bold uppercase tracking-wider text-xs py-3 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: brandColor || '#6033FF' }}
          >
            Save & Back to Agreements
          </button>
        </div>
      </div>
      
      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className="w-full lg:w-[55%] h-full flex flex-col bg-surface-container-low border-2 border-black neu-shadow-sm overflow-hidden rounded-none relative">
        <div className="bg-white border-b-2 border-black p-3 flex justify-between items-center px-4 shrink-0 relative">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 border border-black/20"></div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Live Preview</span>
          </div>
        </div>
        <div ref={previewContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex justify-center relative" style={{ backgroundColor: "#F0F3F6" }}>
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top center", width: "794px", display: "flex", flexDirection: "column", marginBottom: `-${(1 - previewScale) * (pdfRef.current?.offsetHeight || 1123)}px` }}>
            <div ref={pdfRef} className="bg-white shadow-xl shrink-0" style={{ width: '794px', minHeight: '1123px', position: 'relative' }}>
            <div className="p-8 sm:p-12 md:p-[20mm]">
              <div className="header-block flex justify-between items-start mb-8">
                <div>
                  {logoImage ? (
                    <div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>
                      <img src={logoImage} alt="Brand Custom Logo" style={{ maxHeight: '56px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="font-headline font-black text-2xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      LOREM IPSUM.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-headline font-black uppercase tracking-tight max-w-full ml-auto text-right mb-1" style={{ fontFamily: 'var(--font-headline-family)', color: themes.white.text }}>
                    {formData.title || 'CLIENT AGREEMENT'}
                  </h1>
                  <p className="text-xs opacity-80 font-medium">Prepared for {formData.clientName || 'Client'}</p>
                  <p className="text-xs opacity-60 mt-0.5">{((d) => { const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yy = String(d.getFullYear()).slice(-2); return `${dd}/${mm}/${yy}`; })(new Date())}</p>
                </div>
              </div>
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
                  .studio-tiptap, .text-xs\.opacity-80, .text-xs\.opacity-60 { font-family: var(--font-body-family) !important; }
                  .studio-tiptap h1 { font-family: var(--font-headline-family); font-size: 1.8em; font-weight: 900; text-transform: uppercase; color: ${themes.white.text}; }
                  .studio-tiptap h2 { font-family: var(--font-headline-family); font-size: 1.5em; font-weight: 800; text-transform: uppercase; color: ${themes.white.text}; }
                  .studio-tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0 !important; padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
                `}</style>
                <div className="studio-tiptap" dangerouslySetInnerHTML={{ __html: formData.projectDetails || '<p className="italic opacity-50">Content will appear here...</p>' }} />
              </div>


                      {/* Signatures */}
              <div className="html2pdf__page-break"></div>
              <div className="mt-16 pt-8 border-t-2 signatures-block flex flex-col" style={{ borderColor: themes.white.border }}>
                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
                <div className="flex flex-row gap-8 w-full">
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2" style={{ borderColor: themes.white.border }}>
                    <p className="font-headline font-bold uppercase tracking-wide text-xs text-center opacity-60 mb-4" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      {formData.providerSignatureLabel || 'Service Provider Name'}
                    </p>
                    {providerSig ? (
                      <img src={providerSig} alt="Provider Signature" className="h-16 mix-blend-multiply" />
                    ) : (
                      <div className="h-16 flex items-center justify-center opacity-40 font-italic text-sm">Not signed yet</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2" style={{ borderColor: themes.white.border }}>
                    <p className="font-headline font-bold uppercase tracking-wide text-xs text-center opacity-60 mb-4" style={{ fontFamily: 'var(--font-headline-family)' }}>
                      Client Signature
                    </p>
                    {clientSig ? (
                      <img src={clientSig} alt="Client Signature" className="h-16 mix-blend-multiply" />
                    ) : (
                      <div className="h-16 flex items-center justify-center opacity-40 font-italic text-sm">To be signed by client</div>
                    )}
                                                  </div>
              </div>
            </div>
                    </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
export default AgreementStudio;
