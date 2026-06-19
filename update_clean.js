const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.clean = "node clean.js";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
console.log('package.json script clean updated');
