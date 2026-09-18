const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

content = content.replace(
`        </div>
    </div>
    </>
  );
}`,
`        </div>
      </div>
    );`
);

fs.writeFileSync('src/pages/AgreementView.tsx', content);
