const fs = require('fs');
let content = fs.readFileSync('src/pages/AgreementView.tsx', 'utf8');

// Fix the early return error
content = content.replace(
`    return (
      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    </>
  );
}`,
`    return (
      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    );`
);

// Add the correct closing fragment at the very end of the file
// The file currently ends with:
//         </div>
//     </div>
//   );
// }

const endMatch = content.match(/<\/div>\s*<\/div>\s*\);\s*\}/);
if (endMatch) {
  content = content.replace(endMatch[0], '</div>\n    </div>\n    </>\n  );\n}');
}

fs.writeFileSync('src/pages/AgreementView.tsx', content);
