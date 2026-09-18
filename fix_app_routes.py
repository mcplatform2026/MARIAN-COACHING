import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = 'import { Agreements } from "./pages/Agreements";\nimport { AgreementView } from "./pages/AgreementView";\n'
if "import { Agreements }" not in content:
    content = content.replace('import { MonthlyReport } from "./pages/MonthlyReport";', 
                             'import { MonthlyReport } from "./pages/MonthlyReport";\n' + import_statement)

routes_to_add = """          <Route path="report" element={<MonthlyReport />} />
          <Route path="agreements" element={<Agreements />} />"""
if "agreements" not in content:
    content = content.replace('<Route path="report" element={<MonthlyReport />} />', routes_to_add)

public_route = """        <Route path="/login" element={<Login />} />
        <Route path="/agreement/:uid/:id" element={<AgreementView />} />"""
if "/agreement/:uid/:id" not in content:
    content = content.replace('<Route path="/login" element={<Login />} />', public_route)

with open('src/App.tsx', 'w') as f:
    f.write(content)
