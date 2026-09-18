import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';")
text = text.replace("const location = window.location;", "const location = useLocation();")

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
