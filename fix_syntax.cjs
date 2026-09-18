const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');
code = code.replace(/                  }\n                    if \(agreementLinkType === "url"\) \{/g, "                  } else if (field.type === 'agreement_link') {\n                    if (agreementLinkType === \"url\") {");
fs.writeFileSync('src/pages/Clients.tsx', code);
