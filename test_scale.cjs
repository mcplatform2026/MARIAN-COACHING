const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

// 1. Add previewContainerRef
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 sm:p-8 flex sm:justify-center relative" style={{ backgroundColor: "#F0F3F6" }}>/,
  '<div ref={previewContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex justify-center relative" style={{ backgroundColor: "#F0F3F6" }}>'
);

// 2. Add transform to the wrapper of pdfRef
content = content.replace(
  /<div ref={pdfRef} className="sm:mx-auto bg-white shadow-xl shrink-0" style={{ width: '794px', minHeight: '1123px', position: 'relative' }}>/,
  `<div style={{ transform: \`scale(\${previewScale})\`, transformOrigin: 'top center', width: '794px', display: 'flex', flexDirection: 'column' }}>
            <div ref={pdfRef} className="bg-white shadow-xl shrink-0" style={{ width: '794px', minHeight: '1123px', position: 'relative' }}>`
);

// 3. Add closing div for the new wrapper
content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/g,
  `          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );`
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
