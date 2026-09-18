const fs = require('fs');

const files = ['src/pages/Invoices.tsx', 'src/pages/MonthlyReport.tsx'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Change container and clone height to minHeight only, overflow visible
  content = content.replace(/container\.style\.height = "1123px";\s*container\.style\.overflow = "hidden";/g, 'container.style.overflow = "visible";');
  content = content.replace(/clone\.style\.height = "1123px";/g, '');

  fs.writeFileSync(file, content);
});
console.log('done bounds');
