const fs = require('fs');

let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

const tabsStart = '{/* Modal Tabs (Only if not editing) */}';
const tabsEnd = ')}'; // Needs careful targeting.

const startIndex = content.indexOf(tabsStart);
if (startIndex !== -1) {
  const rest = content.slice(startIndex);
  const blockEnd = rest.indexOf('            {bookingMode === \'live\' && !editingId ? (');
  if (blockEnd !== -1) {
    content = content.slice(0, startIndex) + rest.slice(blockEnd);
    fs.writeFileSync('src/pages/Sessions.tsx', content);
    console.log("Success");
  } else {
    console.log("Block end not found");
  }
} else {
  console.log("Tabs start not found");
}
