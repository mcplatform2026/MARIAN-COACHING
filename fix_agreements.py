import re

files_to_patch = [
    'src/components/AgreementStudio.tsx',
    'src/pages/AgreementView.tsx',
    'src/pages/DocumentView.tsx',
    'src/pages/Invoices.tsx',
    'src/pages/MonthlyReport.tsx'
]

def patch_pdf_generator(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except:
        return content

    old_try_block_regex = re.compile(r'try \{.*?catch \(err\) \{.*?\}\s*\};?', re.DOTALL)
    
    if "AgreementStudio" in filepath:
        prefix = "formData"
        theme = "(themes[invoiceTheme] || themes.white)"
        ref = "pdfRef.current"
    elif "Invoices" in filepath:
        prefix = "{invoiceNo || '01'}"
        theme = "(themes[invoiceTheme] || themes.white)"
        ref = "document.getElementById(\"invoice-capture-area\")"
    elif "MonthlyReport" in filepath:
        prefix = "Report"
        theme = "themes.white"
        ref = "reportRef.current"
    else:
        prefix = "agreement"
        theme = "currentTheme"
        ref = "pdfRef.current"
        
    new_try_block = f"""try {{
      const element = {ref};
      if (!element) return;
      
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "794px"; // Standard A4 width in px at 96 DPI
      container.style.overflow = "hidden"; 
      container.style.boxSizing = "border-box";
      
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
      clone.style.padding = "60px 60px"; // Content padding
      clone.style.backgroundColor = {theme}?.bg || '#ffffff';
      clone.style.color = {theme}?.text || '#000000';
      
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));
      
      const pageHeightPx = 1123; // standard A4 height at 794px width
      const marginY = 80; // top/bottom margin for breaks
      
      // Find all possible blocks that shouldn't be cut
      const blocks = clone.querySelectorAll('.studio-tiptap p, .studio-tiptap h1, .studio-tiptap h2, .studio-tiptap ul, .signatures-block, .header-block, .invoice-row, .invoice-header, .invoice-totals, .report-block');
      
      for (let i = 0; i < blocks.length; i++) {{
        const block = blocks[i] as HTMLElement;
        const rect = block.getBoundingClientRect();
        const cloneRect = clone.getBoundingClientRect();
        
        // Calculate top position relative to clone
        const top = rect.top - cloneRect.top;
        const height = rect.height;
        const bottom = top + height;
        
        const pageForTop = Math.floor(top / pageHeightPx);
        // If bottom crosses the safe boundary of the current page
        const bottomBoundary = (pageForTop + 1) * pageHeightPx - marginY; 
        
        // Push down if it crosses boundary AND the block itself isn't taller than a page
        if (bottom > bottomBoundary && height < (pageHeightPx - marginY * 2)) {{
            const targetTop = (pageForTop + 1) * pageHeightPx + marginY;
            const pushAmount = targetTop - top;
            
            // Insert a spacer div before this block to push it down cleanly
            const spacer = document.createElement("div");
            spacer.style.height = pushAmount + 'px';
            spacer.style.width = '100%';
            spacer.style.display = 'block';
            spacer.style.clear = 'both';
            block.parentNode?.insertBefore(spacer, block);
        }}
      }}
      
      // Fix background color to fill the last page seamlessly
      const totalHeight = clone.scrollHeight;
      const pages = Math.ceil(totalHeight / pageHeightPx);
      clone.style.minHeight = `${{pages * pageHeightPx}}px`;
      
      const canvas = await html2canvas(clone, {{
        scale: 2,
        useCORS: true,
        backgroundColor: {theme}?.bg || '#ffffff',
        width: 794,
        windowWidth: 794
      }});
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({{
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }});
      
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = 297;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {{
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }}
      
      let filename = '';
      """
    
    if "Invoices" in filepath:
        new_try_block += f"""filename = `invoice_${{{prefix}}}.pdf`;"""
    else:
        new_try_block += f"""filename = `Agreement_${{{prefix}.clientName || 'Document'}}.pdf`;"""
        
    new_try_block += """
      pdf.save(filename);
      
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
"""
    if "Invoices" in filepath:
        new_try_block += """
      if (typeof setGenerating === 'function') setGenerating(false);
"""
    
    new_try_block += f"""
    }} catch (err) {{
      console.error('Failed to generate PDF:', err);
      alert(`Failed to download PDF: ${{err instanceof Error ? err.message : 'Unknown error'}}`);
"""
    if "Invoices" in filepath:
        new_try_block += """
      if (typeof setIsDownloadModalOpen === 'function') setIsDownloadModalOpen(true);
      if (typeof setGenerating === 'function') setGenerating(false);
"""
    
    new_try_block += """    }"""
    
    gen_idx = content.find("const handleDownloadPDF =")
    if gen_idx != -1:
        try_match = old_try_block_regex.search(content, gen_idx)
        if try_match:
            content = content[:try_match.start()] + new_try_block + content[try_match.end():]
            print(f"Patched PDF logic in {filepath}")
            
    return content

for filepath in files_to_patch:
    content = patch_pdf_generator(filepath)
    
    if "AgreementStudio" in filepath or "AgreementView" in filepath or "DocumentView" in filepath:
        # Fix title size
        content = content.replace('text-3xl font-headline font-black', 'text-5xl font-headline font-black')
        
        # Change cardBg to bg for document outer background
        content = content.replace('.cardBg', '.bg')
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Applied fixes.")
