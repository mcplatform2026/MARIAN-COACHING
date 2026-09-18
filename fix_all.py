import re
import os

files = ["src/pages/AgreementView.tsx", "src/pages/DocumentView.tsx", "src/pages/Invoices.tsx", "src/pages/MonthlyReport.tsx", "src/components/AgreementStudio.tsx"]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    # We want to find the try-catch block of handleDownloadPDF and ensure there is a }; after it.
    # The catch block for handleDownloadPDF contains "Failed to download PDF".
    
    # Let's find the end of that catch block.
    # pattern:
    # catch (err) {
    #   console.error('Failed to generate PDF:', err);
    #   alert(`Failed to download PDF: ...`);
    #   ... anything else ...
    # }
    
    pattern = r"(catch \([^)]+\) \{\s*console\.error\('Failed to generate PDF:', [^\)]+\);\s*alert\([^;]+;\s*(?:if[^\n]+\n\s*)*\})"
    
    match = re.search(pattern, content)
    if match:
        end_idx = match.end()
        # check what is after the block
        after = content[end_idx:end_idx+20]
        if not after.strip().startswith("};"):
            # Insert "};"
            content = content[:end_idx] + "\n  };\n" + content[end_idx:]
            with open(fpath, 'w') as f:
                f.write(content)
            print(f"Fixed {fpath}")
