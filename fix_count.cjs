const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(
`      </div>
    </div>
        
    {/* Actions - Hidden from PDF */}`,
`    </div>
        
    {/* Actions - Hidden from PDF */}`
);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
