import os
import glob

for filepath in ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check for missing bracket before // Print flow
    if "    }\n  // Print flow\n  const handlePrint" in content:
        content = content.replace("    }\n  // Print flow\n  const handlePrint", "    }\n  };\n  // Print flow\n  const handlePrint")
        
    with open(filepath, 'w') as f:
        f.write(content)
