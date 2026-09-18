const fs = require('fs');

const fixScale = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Add state and ref for scale
  if (!content.includes('const [previewScale, setPreviewScale]')) {
    content = content.replace(
      /const pdfRef = useRef<HTMLDivElement>\(null\);/,
      `const pdfRef = useRef<HTMLDivElement>(null);\n  const [previewScale, setPreviewScale] = useState(1);\n  const previewContainerRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    const updateScale = () => {\n      if (previewContainerRef.current) {\n        const containerWidth = previewContainerRef.current.clientWidth - 32; // 16px padding each side\n        if (containerWidth < 794) {\n          setPreviewScale(containerWidth / 794);\n        } else {\n          setPreviewScale(1);\n        }\n      }\n    };\n    updateScale();\n    window.addEventListener('resize', updateScale);\n    return () => window.removeEventListener('resize', updateScale);\n  }, []);\n`
    );
  }

  // Add wrapper
  if (!content.includes('transform: `scale(${previewScale})`')) {
    content = content.replace(
      /<div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex sm:justify-center overflow-x-auto" style={{ backgroundColor: currentTheme.bg }}>/,
      `<div ref={previewContainerRef} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-body text-black flex sm:justify-center overflow-x-hidden" style={{ backgroundColor: currentTheme.bg }}>\n      <div style={{ transform: \`scale(\${previewScale})\`, transformOrigin: "top center", width: "794px", display: "flex", flexDirection: "column", marginBottom: \`-\${(1 - previewScale) * (pdfRef.current?.offsetHeight || 1123)}px\` }}>`
    );

    // add closing div
    content = content.replace(
      /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/g,
      `      </div>\n    </div>\n  </div>\n  </div>\n  );\n}`
    );
  }

  fs.writeFileSync(file, content);
}

fixScale('src/pages/AgreementView.tsx');
fixScale('src/pages/DocumentView.tsx');
