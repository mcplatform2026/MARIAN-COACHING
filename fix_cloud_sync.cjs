const fs = require('fs');
let code = fs.readFileSync('src/components/CloudStorageSync.tsx', 'utf8');

code = code.replace(
  /const originalSetItem = localStorage\.setItem;\s+for \(const key in cloudData\) \{\s+if \(cloudData\[key\] !== undefined && localStorage\.getItem\(key\) !== cloudData\[key\]\) \{\s+originalSetItem\.call\(localStorage, key, cloudData\[key\]\);/g,
  `for (const key in cloudData) {
          if (cloudData[key] !== undefined && localStorage.getItem(key) !== cloudData[key]) {
            Storage.prototype.setItem.call(localStorage, key, cloudData[key]);`
);

fs.writeFileSync('src/components/CloudStorageSync.tsx', code);
console.log("Fixed CloudStorageSync.tsx");
