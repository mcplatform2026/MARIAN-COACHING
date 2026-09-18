const fs = require('fs');

let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

content = content.replace(
`            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
`            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}`);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
