const fs = require('fs');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.publish = "electron-builder --publish always";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
console.log('Script publish añadido');
