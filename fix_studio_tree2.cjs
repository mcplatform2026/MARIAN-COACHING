const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

content = content.replace(
  /              <div className="mt-16 pt-8 border-t-2 signatures-block" style=\{\{ borderColor: themes\.white\.border \}\}>\n                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style=\{\{ fontFamily: 'var\(--font-headline-family\)' \}\}>Signatures & Execution<\/h3>\n                <div className="flex flex-row gap-8 w-full">\n                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1\/2"/g,
  `              <div className="mt-16 pt-8 border-t-2 signatures-block flex-col" style={{ borderColor: themes.white.border }}>
                <h3 className="font-headline font-black uppercase text-lg mb-8 text-center" style={{ fontFamily: 'var(--font-headline-family)' }}>Signatures & Execution</h3>
                <div className="flex flex-row gap-8 w-full">
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed w-1/2"`
);

content = content.replace(
  /                  \)}/g,
  `                  )}`
);

// Actually, I can just append `</div>` to `</div>\n            </div>\n          </div>\n          </div>`
content = content.replace(
  /                <\/div>\n              <\/div>\n            <\/div>\n          <\/div>\n          <\/div>/g,
  `                </div>\n              </div>\n            </div>\n            </div>\n          </div>\n          </div>`
);

fs.writeFileSync('src/components/AgreementStudio.tsx', content);
