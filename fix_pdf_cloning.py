import re

# AgreementStudio.tsx
with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

old_download_fn_studio = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

new_download_fn_studio = """const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      setDownloading(true);
      const element = pdfRef.current;
      
      // Create a temporary off-screen container to isolate the clone and ensure visibility
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "794px"; // Standard A4 width in px at 96 DPI
      container.style.overflow = "hidden"; // Keep within bounds
      container.style.boxSizing = "border-box";
      
      const clone = element.cloneNode(true) as HTMLDivElement;
      // Force absolute dimensions to match A4
      clone.style.width = "794px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none"; // Clean edge for PDF
      clone.style.borderRadius = "0";
      clone.style.display = "block"; // override any potential hidden state
      clone.style.visibility = "visible";
      
      container.appendChild(clone);
      document.body.appendChild(container);
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: themes[invoiceTheme]?.cardBg || '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794
      });
      
      // Remove temporary cloning container from document body
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      
      if (!canvas || canvas.width === 0) {
        throw new Error("Canvas is empty or has 0 width.");
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Verify valid dimensions
      if (isNaN(pdfHeight) || pdfHeight <= 0) {
          throw new Error("Calculated PDF height is invalid");
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      pdf.save(`Draft_Agreement_${formData.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(`Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };"""

content = re.sub(old_download_fn_studio, new_download_fn_studio, content)

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)

# AgreementView.tsx
with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

old_download_fn_view = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

new_download_fn_view = """const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      setDownloading(true);

      const element = pdfRef.current;
      
      // Create a temporary off-screen container to isolate the clone
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "794px"; // Standard A4 width in px at 96 DPI
      container.style.overflow = "hidden"; // Keep within bounds
      container.style.boxSizing = "border-box";
      
      const clone = element.cloneNode(true) as HTMLDivElement;
      // Force absolute dimensions to match A4
      clone.style.width = "794px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none"; // Clean edge for PDF
      clone.style.borderRadius = "0";
      clone.style.display = "block"; // override any potential hidden state
      clone.style.visibility = "visible";
      
      // Temporarily hide ignored elements in clone
      const ignoredElements = clone.querySelectorAll('[data-html2pdf-ignore="true"]');
      ignoredElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      container.appendChild(clone);
      document.body.appendChild(container);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: themes[agreement?.theme || 'white']?.cardBg || '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794
      });

      // Remove temporary cloning container from document body
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }

      if (!canvas || canvas.width === 0) {
        throw new Error("Canvas is empty or has 0 width.");
      }

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      if (isNaN(pdfHeight) || pdfHeight <= 0) {
          throw new Error("Calculated PDF height is invalid");
      }
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= 297; // A4 height
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= 297;
      }
      
      pdf.save(`Agreement_${agreement?.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(`Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };"""

content = re.sub(old_download_fn_view, new_download_fn_view, content)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)

