import re

# Update AgreementStudio.tsx
with open('src/components/AgreementStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace("import domtoimage from 'dom-to-image-more';", 'import html2canvas from "html2canvas-pro";')

old_download_fn_pattern = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

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
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`Draft_Agreement_${formData.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };"""

content = re.sub(old_download_fn_pattern, new_download_fn_studio, content)

with open('src/components/AgreementStudio.tsx', 'w') as f:
    f.write(content)

# Update AgreementView.tsx
with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import domtoimage from 'dom-to-image-more';", 'import html2canvas from "html2canvas-pro";')

old_download_fn_view_pattern = re.compile(r'const handleDownloadPDF = async \(\) => \{.*?setDownloading\(false\);\n    \}\n  \};', re.DOTALL)

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

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`Agreement_${agreement?.clientName || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };"""

content = re.sub(old_download_fn_view_pattern, new_download_fn_view, content)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
