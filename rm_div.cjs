const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

code = code.replace(
`  </div>
  </div>
  </div>
  </div>
  );
}`,
`  </div>
  </div>
  </div>
  );
}`);

fs.writeFileSync('src/pages/AgreementView.tsx', code);
