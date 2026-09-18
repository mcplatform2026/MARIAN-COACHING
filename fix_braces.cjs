const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

content = content.replace(
`      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    );

  if (error) {`,
`      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    );
  }

  if (error) {`
);

content = content.replace(
`        </div>
      </div>
    );

  if (!agreement) return null;`,
`        </div>
      </div>
    );
  }

  if (!agreement) return null;`
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
