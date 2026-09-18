import re

files = ['src/pages/Dashboard.tsx', 'src/pages/MonthlyReport.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Restore the icon size to 1rem to keep it consistent with the rest of the UI
    # but keep the position at right 0.35rem center and padding at pr-7
    # Right now it has backgroundSize: '1.25rem'
    content = content.replace("backgroundSize: '1.25rem'", "backgroundSize: '1rem'")

    with open(file_path, 'w') as f:
        f.write(content)
