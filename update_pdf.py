with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

if "import html2pdf from 'html2pdf.js';" not in content:
    content = content.replace("import html2canvas from 'html2canvas-pro';\nimport { jsPDF } from 'jspdf';", "import html2pdf from 'html2pdf.js';")

new_handle_pdf = """  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !agreement) return;
    try {
      setDownloading(true);
      const element = pdfRef.current;
      const opt = {
        margin:       10,
        filename:     `${agreement.clientName.replace(/\\s+/g, '_')}_Agreement.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };"""

import re
content = re.sub(r"  const handleDownloadPDF = async \(\) => \{.*?\n  \};", lambda x: new_handle_pdf, content, flags=re.DOTALL)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
