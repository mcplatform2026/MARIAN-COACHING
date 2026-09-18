const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace the old container logic with an iframe logic
  const oldCodeStart = 'const container = document.createElement("div");';
  const oldCodeEnd = 'const imgData = canvas.toDataURL(\'image/jpeg\', 0.98);';
  
  if (!code.includes(oldCodeStart)) {
    console.log('Could not find start in', filePath);
    return;
  }
  
  const startIndex = code.indexOf(oldCodeStart);
  const endIndex = code.indexOf(oldCodeEnd);
  
  if (endIndex === -1) {
    console.log('Could not find end in', filePath);
    return;
  }
  
  const blockToReplace = code.substring(startIndex, endIndex);

  // We are going to build an iframe, inject the styles, and append the clone.
  const iframeLogic = `
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '1448px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      if (typeof setGenerating === 'function') setGenerating(false);
      return;
    }
    
    iframeDoc.open();
    iframeDoc.write('<html><head>');
    // Copy all styles from the main document to ensure Tailwind classes are available
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => {
      iframeDoc.write(s.outerHTML);
    });
    // Add Google Fonts so they render in the iframe
    iframeDoc.write('<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">');
    iframeDoc.write('</head><body style="margin:0; padding:0;">');
    iframeDoc.write('<div id="pdf-container" style="width: 794px; min-height: 1123px;"></div>');
    iframeDoc.write('</body></html>');
    iframeDoc.close();

    const pdfContainer = iframeDoc.getElementById('pdf-container');
    if (!pdfContainer) {
      document.body.removeChild(iframe);
      return;
    }

    const bg = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.bg || '#ffffff' : '#ffffff';
    const textCol = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.text || '#000000' : '#000000';
    
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

    pdfContainer.appendChild(clone);

    let canvas;
    try {
      // Allow DOM to compute styles and fonts to load
      await new Promise(r => setTimeout(r, 800));

      canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg,
        width: 794,
        windowWidth: 1024,
        logging: false
      });
    } catch (err) {
      console.error(err);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      if (typeof setGenerating === 'function') setGenerating(false);
      if (typeof setDownloading === 'function') setDownloading(false);
      return;
    }
    
    // Clean up iframe before moving to PDF generation to save memory
    if (document.body.contains(iframe)) document.body.removeChild(iframe);

    `;

  code = code.replace(blockToReplace, iframeLogic);
  
  // Clean up old cleanup logic
  code = code.replace(
    /if \(document\.body\.contains\(container\)\) \{\s*document\.body\.removeChild\(container\);\s*\}/g,
    ''
  );
  
  fs.writeFileSync(filePath, code);
  console.log('Successfully injected iframe logic to', filePath);
}

fixFile('src/pages/Invoices.tsx');
fixFile('src/pages/MonthlyReport.tsx');

