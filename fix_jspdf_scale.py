import re

# Update AgreementStudio.tsx
with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

old_download_fn_studio = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

new_download_fn_studio = """const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      setDownloading(true);
      const element = pdfRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: themes[invoiceTheme]?.cardBg || '#ffffff',
        logging: false
      });
      
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


# Update AgreementView.tsx
with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

old_download_fn_view = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

new_download_fn_view = """const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      setDownloading(true);

      // Temporarily hide ignored elements
      const ignoredElements = pdfRef.current.querySelectorAll('[data-html2pdf-ignore="true"]');
      ignoredElements.forEach(el => (el as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: themes[agreement?.theme || 'white']?.cardBg || '#ffffff',
        logging: false
      });

      // Restore ignored elements
      ignoredElements.forEach(el => (el as HTMLElement).style.display = '');

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

