const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

const endPattern = /(<\/div>\s*){4}\s*(\{\/\* Actions - Hidden from PDF \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\})/;

content = content.replace(endPattern, 
`</div>
                </div>
              </div>
            </div>
          </div>
          
      $2`);
fs.writeFileSync('src/pages/AgreementView.tsx', content);
