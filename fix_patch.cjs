const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskTracker.tsx', 'utf8');

const svgLarge = '<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L5 6L10 0H0Z" fill="currentColor"/></svg>';
const svgSmall = '<svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L5 6L10 0H0Z" fill="currentColor"/></svg>';

code = code.replace(/<size=\{14\} strokeWidth=\{3\} \/>/g, svgLarge);
code = code.replace(/<size=\{12\} strokeWidth=\{3\} \/>/g, svgSmall);

fs.writeFileSync('src/pages/TaskTracker.tsx', code);
