const fs = require('fs');
let code = fs.readFileSync('src/pages/MonthlyReport.tsx', 'utf8');

const hook = `        if (newClasses.includes('md:grid-cols-4')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-4');
        }`;

const replacement = `        if (newClasses.includes('md:grid-cols-4')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-4');
        }
        
        // HTML2Canvas grid bug fixes (only applied to the clone for PDF generation)
        if (newClasses.includes('grid-cols-3') && newClasses.includes('grid')) {
           newClasses = newClasses.replace('grid', 'flex flex-row w-full justify-between').replace('grid-cols-3', '');
        }
        if (newClasses.includes('border-2 border-black')) {
           // Apply roughly 32% width to the grid children when they are converted to flex
           // The children of the grid-cols-3 usually have border-2 border-black.
           if (el.parentElement && el.parentElement.className && typeof el.parentElement.className === 'string' && el.parentElement.className.includes('grid-cols-3')) {
               newClasses = newClasses + ' w-[32%]';
           } else if (!el.parentElement) {
               // Fallback: just give it w-[32%] if it looks like the stat block
               if (newClasses.includes('bg-neutral-50 p-3') || newClasses.includes('text-white p-3')) {
                   newClasses = newClasses + ' w-[32%]';
               }
           }
        }`;

code = code.replace(hook, replacement);
fs.writeFileSync('src/pages/MonthlyReport.tsx', code);
console.log('Updated clone loop in MonthlyReport.tsx');
