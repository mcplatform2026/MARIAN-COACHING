const fs = require('fs');

function fix(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (code.includes('} catch (err) {')) {
    code = code.replace(/} catch \(err\) {/g, "  } catch (err) {");
  }
  
  if (!code.includes("try {") && code.includes("} catch")) {
     code = code.replace("const imgData =", "try { const imgData =");
  }
  
  // Actually, let's just forcefully replace the whole function again with a clean one that doesn't use iframes.
  // The iframe approach was too complex and caused syntax issues. We will use a CSS hack instead.
  
  const startKeyword = 'const handleDownloadPDF = async () => {';
  const startIdx = code.indexOf(startKeyword);
  if (startIdx === -1) return;
  
  const endKeyword = '    } finally {';
  let endIdx = code.indexOf(endKeyword, startIdx);
  if (endIdx === -1) {
     // try finding alternative end
     endIdx = code.indexOf('if (typeof setGenerating', startIdx);
  }
  
  const endBlockIdx = code.indexOf('};', startIdx);
  
  const oldBlock = code.substring(startIdx, endBlockIdx + 2);
  
  const newBlock = `const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-capture-area") || document.getElementById("monthly-report-capture-area");
    if (!element) return;

    if (typeof setGenerating === 'function') setGenerating(true);
    if (typeof setDownloading === 'function') setDownloading(true);
    if (typeof setFallbackImageUrl === 'function') setFallbackImageUrl(null);

    // Create a temporary off-screen container to isolate the clone
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "794px";
    container.style.overflow = "visible"; 
    container.style.boxSizing = "border-box";
    
    const bg = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.bg || '#ffffff' : '#ffffff';
    const textCol = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.text || '#000000' : '#000000';
    container.style.backgroundColor = bg;

    const clone = element.cloneNode(true);
    clone.style.width = "794px";
    clone.style.minHeight = "1123px";
    
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none"; 
    clone.style.borderRadius = "0";
    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.visibility = "visible";
    clone.style.boxSizing = "border-box";
    clone.style.padding = "64px";
    clone.style.backgroundColor = bg;
    clone.style.color = textCol;

    const footerContact = clone.querySelector('#footer-contact-row');
    if (footerContact) {
      footerContact.className = "flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide";
      footerContact.style.fontSize = "15px";
    }

    // Hide any UI action elements (Monthly Report)
    const actionElements = clone.querySelectorAll(".no-print");
    actionElements.forEach(el => el.style.display = "none");

    // CRITICAL FIX: Force desktop layout for mobile PDF generation by manually overriding mobile flex classes
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.className && typeof el.className === 'string') {
        let newClasses = el.className;
        // Strip out mobile-first flex-col and replace with row if it has md:flex-row
        if (newClasses.includes('md:flex-row')) {
           newClasses = newClasses.replace('flex-col', 'flex-row');
        }
        // Force width expansions
        if (newClasses.includes('md:w-1/2')) {
           newClasses = newClasses.replace('w-full', 'w-1/2');
        }
        if (newClasses.includes('md:grid-cols-2')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-2');
        }
        if (newClasses.includes('md:grid-cols-3')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-3');
        }
        if (newClasses.includes('md:grid-cols-4')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-4');
        }
        el.className = newClasses;
      }
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg,
        width: 794,
        windowWidth: 1024,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const invoiceNoStr = typeof invoiceNo !== 'undefined' ? invoiceNo : 'report';
      const filename = element.id.includes('invoice') ? \`invoice_\${invoiceNoStr}.pdf\` : \`Monthly_Report.pdf\`;
      
      pdf.save(filename);

    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(\`Failed to download PDF: \${err instanceof Error ? err.message : 'Unknown error'}\`);
      if (typeof setIsDownloadModalOpen === 'function') setIsDownloadModalOpen(true);
    } finally {
      if (document.body.contains(container)) document.body.removeChild(container);
      if (typeof setGenerating === 'function') setGenerating(false);
      if (typeof setDownloading === 'function') setDownloading(false);
    }
  };`;
  
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, code);
  console.log('Fixed', filePath);
}

fix('src/pages/Invoices.tsx');
fix('src/pages/MonthlyReport.tsx');
