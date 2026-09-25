import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

interface GeneratePDFOptions {
  element: HTMLElement;
  filename: string;
  widthPx?: number;
  minHeightPx?: number;
  padding?: string;
  backgroundColor?: string;
  textColor?: string;
  scale?: number;
  multiPage?: boolean;
}

/**
 * Universal High-Fidelity PDF Generator
 * 
 * Directly captures the live, rendered DOM element with full CSS/font support.
 * Produces crisp, 100% valid, uncorrupted PDF documents that open cleanly in
 * Google Chrome, Acrobat, and all standard PDF readers without any "Failed to load PDF document" errors.
 */
export async function generateUniversalPDF({
  element,
  filename,
  widthPx = 794,
  minHeightPx,
  padding,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  scale = 2,
  multiPage = false,
}: GeneratePDFOptions): Promise<void> {
  if (!element) {
    throw new Error("Target element for PDF generation was not found.");
  }

  // 1. Wait for document fonts to settle
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  // 2. Ensure all images inside target element are loaded
  const imgElements = Array.from(element.querySelectorAll("img"));
  if (imgElements.length > 0) {
    await Promise.all(
      imgElements.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  }

  // Small delay to ensure any dynamic paints/fonts have finalized
  await new Promise((r) => setTimeout(r, 60));

  // 3. Capture element directly using html2canvas-pro with CORS & high scale
  const canvas = await html2canvas(element, {
    scale: scale || 2,
    useCORS: true,
    allowTaint: false, // Must be false so canvas.toDataURL() is never blocked/tainted
    backgroundColor: backgroundColor || "#ffffff",
    logging: false,
    imageTimeout: 15000,
    windowWidth: 1200, // Forces desktop breakpoints in layout during clone
    ignoreElements: (el: Element) => {
      return (
        el.classList?.contains("no-print") ||
        el.getAttribute?.("data-html2pdf-ignore") === "true"
      );
    },
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      // Reset any CSS transforms (e.g., zoom/scale preview containers) on the element and its ancestors
      clonedEl.style.transform = "none";
      clonedEl.style.margin = "0 auto";
      clonedEl.style.boxShadow = "none";
      clonedEl.style.borderRadius = "0";
      clonedEl.style.overflow = "visible";

      if (widthPx) {
        clonedEl.style.width = `${widthPx}px`;
        clonedEl.style.minWidth = `${widthPx}px`;
        clonedEl.style.maxWidth = `${widthPx}px`;
        clonedEl.style.boxSizing = "border-box";
      }

      if (minHeightPx) {
        clonedEl.style.minHeight = `${minHeightPx}px`;
      }

      if (typeof padding === "string" && padding.trim().length > 0) {
        clonedEl.style.padding = padding;
      }

      if (backgroundColor) {
        clonedEl.style.backgroundColor = backgroundColor;
      }
      if (textColor) {
        clonedEl.style.color = textColor;
      }

      // Reset transform on all parent elements in the cloned DOM tree
      let parent = clonedEl.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.transform = "none";
        parent.style.overflow = "visible";
        parent = parent.parentElement;
      }

      // Clean up any remaining non-printable elements in the clone
      clonedDoc
        .querySelectorAll('.no-print, [data-html2pdf-ignore="true"]')
        .forEach((item) => item.remove());
    },
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Failed to render document to canvas.");
  }

  // 4. Export canvas to valid image data
  let imgData: string;
  try {
    imgData = canvas.toDataURL("image/jpeg", 0.98);
  } catch {
    imgData = canvas.toDataURL("image/png");
  }

  if (!imgData || imgData === "data:," || imgData.length < 100) {
    throw new Error("Failed to extract valid image data from rendered document.");
  }

/**
 * Scans a range of rows backwards from targetY to find the optimal empty whitespace row
 * (row without any ink/text pixels) to safely break a page without slicing characters.
 */
function findSafePageBreakY(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  targetY: number,
  maxLookback: number = 240
): number {
  const minSearchY = Math.max(startY + 60, targetY - maxLookback);
  if (targetY <= minSearchY) return targetY;

  const searchHeight = targetY - minSearchY;
  // Inset horizontal bounds by 16px to avoid checking outer container edges or borders
  const insetX = 16;
  const sampleWidth = Math.max(10, width - insetX * 2);

  try {
    const strip = ctx.getImageData(insetX, minSearchY, sampleWidth, searchHeight);
    const data = strip.data;

    let bestWhitespaceY = -1;
    let longestWhitespaceStreak = 0;
    let currentStreakStart = -1;
    let currentStreakLen = 0;

    // Scan from bottom (targetY - 1) up towards minSearchY
    for (let relY = searchHeight - 1; relY >= 0; relY--) {
      let isRowBlank = true;
      const rowOffset = relY * sampleWidth * 4;

      // Sample every 4th pixel for rapid performance
      for (let x = 0; x < sampleWidth; x += 4) {
        const p = rowOffset + x * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const a = data[p + 3];

        // If pixel is visible and significantly darker than pure white (#ffffff)
        // Background is white/off-white (245+), ink is dark text (< 235)
        if (a > 30 && (r < 235 || g < 235 || b < 235)) {
          isRowBlank = false;
          break;
        }
      }

      if (isRowBlank) {
        if (currentStreakLen === 0) {
          currentStreakStart = relY;
        }
        currentStreakLen++;
        if (currentStreakLen >= 4 && currentStreakLen > longestWhitespaceStreak) {
          longestWhitespaceStreak = currentStreakLen;
          // Middle of the whitespace gap
          bestWhitespaceY = minSearchY + currentStreakStart - Math.floor(currentStreakLen / 2);
        }
      } else {
        currentStreakLen = 0;
      }
    }

    if (bestWhitespaceY > startY) {
      return bestWhitespaceY;
    }
  } catch (e) {
    console.warn("Smart page break scan fell back:", e);
  }

  return targetY;
}

  // 5. Build high-fidelity A4 jsPDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const a4WidthMm = 210;
  const a4HeightMm = 297;
  const imgWidthMm = a4WidthMm;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  if (!multiPage) {
    // Single page document (Invoices, Monthly Reports)
    if (imgHeightMm <= a4HeightMm) {
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm, undefined, "FAST");
    } else {
      // Scale down proportionally to fit on a single A4 page without clipping or blank pages
      const scaleFactor = (a4HeightMm - 4) / imgHeightMm;
      const fittedWidth = imgWidthMm * scaleFactor;
      const offsetX = (a4WidthMm - fittedWidth) / 2;
      pdf.addImage(imgData, "JPEG", offsetX, 2, fittedWidth, a4HeightMm - 4, undefined, "FAST");
    }
  } else {
    // Multi-page document (Agreements with multiple clauses)
    // Uniform 14mm margins on all 4 sides of EVERY page with smart page-break detection
    const marginMm = 14;
    const footerReserveMm = 10;
    const usableWidthMm = a4WidthMm - (marginMm * 2); // 182mm
    const usableHeightMm = a4HeightMm - (marginMm * 2) - footerReserveMm; // 259mm

    const pxPerMm = canvas.width / usableWidthMm;
    const maxSliceHeightPx = Math.floor(usableHeightMm * pxPerMm);

    const ctx2d = canvas.getContext("2d", { willReadFrequently: true });
    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      const remainingPx = canvas.height - currentY;
      // Ignore tiny trailing sub-pixel slices (< 10px) to avoid accidental blank last pages
      if (remainingPx <= 10 && pageIndex > 0) {
        break;
      }

      let sliceEndY = currentY + Math.min(maxSliceHeightPx, remainingPx);

      // If this page does not reach the very end of the document, find a safe break line
      if (sliceEndY < canvas.height && ctx2d) {
        sliceEndY = findSafePageBreakY(ctx2d, canvas.width, currentY, sliceEndY, 240);
      }

      const currentSliceHeight = Math.max(1, sliceEndY - currentY);

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = currentSliceHeight;

      const sliceCtx = sliceCanvas.getContext("2d");
      if (sliceCtx) {
        sliceCtx.fillStyle = backgroundColor || "#ffffff";
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        let sliceData: string = "";
        try {
          sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98);
        } catch {
          sliceData = sliceCanvas.toDataURL("image/png");
        }

        if (sliceData && sliceData.length > 100 && sliceData !== "data:,") {
          const sliceHeightMm = (currentSliceHeight * usableWidthMm) / canvas.width;
          if (pageIndex > 0) {
            pdf.addPage("a4", "portrait");
          }
          // Draw cleanly inside 14mm margins on all sides
          pdf.addImage(sliceData, "JPEG", marginMm, marginMm, usableWidthMm, sliceHeightMm, undefined, "FAST");
          pageIndex++;
        }
      }

      currentY = sliceEndY;
    }

    // Add elegant professional footer to every page
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 140);
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.2);
      // Divider line for footer
      pdf.line(marginMm, a4HeightMm - 12, a4WidthMm - marginMm, a4HeightMm - 12);

      const cleanDocTitle = (filename.replace(/\.pdf$/i, "").replace(/^Agreement_/i, "") || "Client Agreement").replace(/_/g, " ").toUpperCase();
      pdf.text(`MARIAN COACHING  •  ${cleanDocTitle}`, marginMm, a4HeightMm - 7);
      pdf.text(`Page ${p} of ${totalPages}`, a4WidthMm - marginMm, a4HeightMm - 7, { align: "right" });
    }
  }

  // 6. Output real PDF Blob & trigger reliable download
  const safeFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  const pdfBlob = pdf.output("blob");

  if (!pdfBlob || pdfBlob.size === 0) {
    throw new Error("Generated PDF file is empty or invalid.");
  }

  const blobUrl = window.URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement("a");
  downloadLink.style.display = "none";
  downloadLink.href = blobUrl;
  downloadLink.download = safeFilename;
  downloadLink.rel = "noopener";
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // CRITICAL: Do NOT revokeObjectURL immediately!
  // In Chromium, synchronous revokeObjectURL aborts the in-flight download stream,
  // creating a corrupted/empty PDF file that causes "Error: Failed to load PDF document."
  setTimeout(() => {
    try {
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // ignore
    }
  }, 60000);
}
