const babel = require('@babel/core');
const fs = require('fs');

try {
  babel.parseSync(fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8'), {
    filename: 'AgreementStudio.tsx',
    presets: ['@babel/preset-typescript', '@babel/preset-react']
  });
  console.log("Valid JSX!");
} catch (e) {
  console.error(e.message);
}
