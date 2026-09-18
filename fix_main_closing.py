import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Replace the very last closing div with </main>
# We can find the end of the file and do it.
# Actually, the file ends with:
#       )}
#     </div>
#   );
# }

content = re.sub(r'    </div>\n  \);\n}\n?$', '    </main>\n  );\n}', content)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)

