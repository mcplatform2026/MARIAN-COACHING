const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('TaskTracker')) {
  content = content.replace(
    'import { Agreements } from "./pages/Agreements";',
    'import { Agreements } from "./pages/Agreements";\nimport { TaskTracker } from "./pages/TaskTracker";'
  );

  content = content.replace(
    '<Route path="agreements" element={<Agreements />} />',
    '<Route path="agreements" element={<Agreements />} />\n          <Route path="tasks" element={<TaskTracker />} />'
  );

  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx");
} else {
  console.log("App.tsx already patched");
}
