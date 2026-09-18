import re

with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import html2canvas from 'html2canvas';", "import domtoimage from 'dom-to-image-more';")
content = content.replace("data-html2canvas-ignore", "data-html2pdf-ignore")

pdf_block = """
      // Temporarily hide ignored elements
      const ignoredElements = pdfRef.current.querySelectorAll('[data-html2pdf-ignore="true"]');
      ignoredElements.forEach(el => (el as HTMLElement).style.display = 'none');

      const dataUrl = await domtoimage.toPng(pdfRef.current, {
        quality: 1,
        bgcolor: '#ffffff'
      });

      // Restore ignored elements
      ignoredElements.forEach(el => (el as HTMLElement).style.display = '');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
"""

# replace the html2canvas block
old_pdf_block = r"""      const canvas = await html2canvas\(pdfRef\.current, \{
        scale: 2,
        useCORS: true,
        logging: false,
      \}\);
      const imgData = canvas\.toDataURL\('image/png'\);
      const pdf = new jsPDF\('p', 'mm', 'a4'\);
      const pdfWidth = pdf\.internal\.pageSize\.getWidth\(\);
      const pdfHeight = \(canvas\.height \* pdfWidth\) / canvas\.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf\.addImage\(imgData, 'PNG', 0, position, pdfWidth, pdfHeight\);"""

content = re.sub(old_pdf_block, pdf_block.strip(), content, flags=re.MULTILINE | re.DOTALL)

# replace imgData with dataUrl in the loop
content = content.replace("pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);", "pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);")

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
