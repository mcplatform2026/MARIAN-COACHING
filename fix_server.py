import re

with open('server.ts', 'r') as f:
    text = f.read()

target = """91: 4. NAVIGATE: Navigate to a different dashboard section.
92:    - Parameters:
93:      - path: "/" (for dashboard/transactions), "/clients", "/appointments", "/invoices", "/report" (monthly report)
94:      - monthName: (optional, for Monthly Report) full month name, e.g., "January", "February", etc.
95:      - yearValue: (optional, for Monthly Report) e.g., 2026"""

replacement = """91: 4. NAVIGATE: Navigate to a different dashboard section. Use this when the user says "open the dashboard", "open my income dashboard", "show me my report", etc.
92:    - Parameters:
93:      - path: "/" (for dashboard/transactions), "/clients", "/appointments", "/invoices", "/report" (monthly report). If the user asks for "dashboard for [month]", ALWAYS use path="/" and provide the monthName and yearValue.
94:      - monthName: (optional, for Dashboard and Monthly Report) full month name, e.g., "January", "February", etc.
95:      - yearValue: (optional, for Dashboard and Monthly Report) e.g., 2026"""

text = text.replace(target, replacement)

with open('server.ts', 'w') as f:
    f.write(text)
