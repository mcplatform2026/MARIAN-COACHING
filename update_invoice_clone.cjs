const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

// We need to inject our grid-to-flex replacements inside the allElements.forEach loop.
const hook = `        if (newClasses.includes('md:grid-cols-4')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-4');
        }`;

const replacement = `        if (newClasses.includes('md:grid-cols-4')) {
           newClasses = newClasses.replace('grid-cols-1', 'grid-cols-4');
        }
        
        // HTML2Canvas grid bug fixes (only applied to the clone for PDF generation)
        if (newClasses.includes('grid-cols-2') && newClasses.includes('grid')) {
           newClasses = newClasses.replace('grid', 'flex flex-row w-full justify-between').replace('grid-cols-2', '');
        }
        if (newClasses.includes('grid-cols-12') && newClasses.includes('grid')) {
           newClasses = newClasses.replace('grid', 'flex flex-row w-full').replace('grid-cols-12', '');
        }
        if (newClasses.includes('col-span-10')) {
           newClasses = newClasses.replace('col-span-10', 'w-[83.333333%]');
        }
        if (newClasses.includes('col-span-8')) {
           newClasses = newClasses.replace('col-span-8', 'w-[66.666667%]');
        }
        if (newClasses.includes('col-span-4')) {
           newClasses = newClasses.replace('col-span-4', 'w-[33.333333%]');
        }
        if (newClasses.includes('col-span-2')) {
           newClasses = newClasses.replace('col-span-2', 'w-[16.666667%]');
        }`;

code = code.replace(hook, replacement);
fs.writeFileSync('src/pages/Invoices.tsx', code);
console.log('Updated clone loop in Invoices.tsx');
