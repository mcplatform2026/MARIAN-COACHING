const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

content = content.replace(/<\/div>(\s*<\/div>)+\s*\);\s*\}/s, '                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  );\n}');

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
