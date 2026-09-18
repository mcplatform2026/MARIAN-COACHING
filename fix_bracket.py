import os
import glob

for filepath in ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if there is missing bracket before useEffect or other functions
    if "}  useEffect(() => {" in content:
        content = content.replace("}  useEffect(() => {", "  };\n\n  useEffect(() => {")
    elif "}  const handle" in content:
        content = content.replace("}  const handle", "  };\n\n  const handle")
        
    with open(filepath, 'w') as f:
        f.write(content)
