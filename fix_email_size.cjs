const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  '<p className="font-body font-medium text-[10.5px] text-outline truncate lowercase tracking-normal leading-normal mt-0.5">{user?.email}</p>',
  '<p className="font-body font-medium text-[12px] text-outline truncate lowercase tracking-normal leading-normal mt-0.5">{user?.email}</p>'
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Fixed email size');
