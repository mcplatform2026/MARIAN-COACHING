const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const originalImport = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800;900&family=Archivo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Alex+Brush&family=Herr+Von+Muellerhoff&family=Monsieur+La+Doulaise&family=Meow+Script&family=Caveat:wght@400..700&display=swap');";
const newImport = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800;900&family=Archivo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700;800&family=Alex+Brush&family=Herr+Von+Muellerhoff&family=Monsieur+La+Doulaise&family=Meow+Script&family=Caveat:wght@400..700&display=swap');";

code = code.replace(originalImport, newImport);

fs.writeFileSync('src/index.css', code);
