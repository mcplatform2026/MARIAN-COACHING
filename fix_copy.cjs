const fs = require('fs');

let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');
content = content.replace(
  /<p className="font-body text-\[10px\] text-neutral-500 italic text-center">\s*Appointments scheduled here must be manually logged to appear in your list\.\s*<\/p>/g,
  `<p className="font-body text-[10px] text-neutral-500 italic text-center">\n                      Appointments scheduled here will automatically sync to your session logs list if integrated.\n                    </p>`
);

fs.writeFileSync('src/pages/Sessions.tsx', content);
console.log("Success");
