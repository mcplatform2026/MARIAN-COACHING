const fs = require('fs');
const file = 'src/pages/MonthlyReport.tsx';
let content = fs.readFileSync(file, 'utf8');

const helper = `const getFormattedCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return \`\${day}/\${month}/\${year}\`;
};`;

// Inject helper
const targetImport = 'import { Printer, Download, ChevronLeft, ChevronRight, FileText, Calendar as CalendarIcon, Filter } from "lucide-react";';
if (content.includes(targetImport)) {
  content = content.replace(targetImport, targetImport + '\\n\\n' + helper);
}

content = content.replace('{new Date().toLocaleDateString()}', '{getFormattedCurrentDate()}');

fs.writeFileSync(file, content);
console.log('Patched monthly report');
