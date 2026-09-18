import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Replace the CreateAgreementForm function completely
# First, find the function definition
form_start = content.find("function CreateAgreementForm")
# Find the next function or component, which is "export function Agreements()"
agreements_start = content.find("export function Agreements()")

if form_start != -1 and agreements_start != -1:
    content = content[:form_start] + content[agreements_start:]

# Replace the component usage
content = content.replace("<CreateAgreementForm", "<AgreementStudio")

# Add the import
import_statement = "import { AgreementStudio } from '../components/AgreementStudio';\n"
content = content.replace("import { SignatureCanvasBlock } from '../components/SignatureCanvasBlock';", "import { SignatureCanvasBlock } from '../components/SignatureCanvasBlock';\n" + import_statement)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
