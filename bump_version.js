const fs = require('fs');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Bump version
let versionParts = pkg.version.split('.');
versionParts[2] = parseInt(versionParts[2]) + 1;
pkg.version = versionParts.join('.');

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
console.log('Versión actualizada a ' + pkg.version);
