const fs = require('fs');
let code = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Fix the error block:
code = code.replace(
`        </div>
  </div>
  </div>
  </div>
  );
}`, 
`        </div>
      </div>
    );
}`);

// At the end of the file, we currently have:
//     </div>
//   </div>
//   );
// }

// Let's replace the end of the file.
code = code.replace(/    <\/div>\s*<\/div>\s*\);\s*\}\s*$/, '    </div>\n  </div>\n  </div>\n  </div>\n  );\n}\n');

fs.writeFileSync('src/pages/AgreementView.tsx', code);
