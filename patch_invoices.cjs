const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

code = code.replace(
  `  status?: 'paid' | 'unpaid';
  createdAt?: any;
}`,
  `  status?: 'paid' | 'unpaid';
  shortShareId?: string;
  createdAt?: any;
}`
);

fs.writeFileSync('src/pages/Invoices.tsx', code);
