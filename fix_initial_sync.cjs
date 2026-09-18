const fs = require('fs');
let code = fs.readFileSync('src/components/CloudStorageSync.tsx', 'utf8');

code = code.replace(
  /localStorage\.setItem\(key, cloudData\[key\]\);/g,
  `Storage.prototype.setItem.call(localStorage, key, cloudData[key]);`
);

fs.writeFileSync('src/components/CloudStorageSync.tsx', code);
console.log("Fixed initial sync");
