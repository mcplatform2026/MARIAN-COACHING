const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const anchor = `<input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle')?.color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" />`;

const replacement = `<input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle')?.color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    editor?.chain().focus().setFontSize(e.target.value).run();
                  } else {
                    editor?.chain().focus().unsetFontSize().run();
                  }
                }}
                className="h-8 border-2 border-black bg-white text-xs font-bold px-1 ml-1 cursor-pointer outline-none"
                value={editor?.getAttributes('textStyle')?.fontSize || ''}
              >
                <option value="">Size</option>
                {Array.from({ length: 29 }, (_, i) => 8 + i * 2).map((size) => (
                  <option key={size} value={\`\${size}px\`}>{size}px</option>
                ))}
              </select>`;

content = content.replace(anchor, replacement);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
