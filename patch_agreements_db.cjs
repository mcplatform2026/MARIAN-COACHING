const fs = require('fs');
let code = fs.readFileSync('src/pages/Agreements.tsx', 'utf8');

if (!code.includes('import { db }')) {
  code = code.replace("import { useAuth } from '../components/AuthProvider';", "import { useAuth } from '../components/AuthProvider';\nimport { db } from '../lib/firebase';");
}
fs.writeFileSync('src/pages/Agreements.tsx', code);
