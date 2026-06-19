const fs = require('fs');
let main = fs.readFileSync('main.js', 'utf8');
main = main.replace(
    /res\.json\(\{ available: true, version: '3.0.0 \(SIMULACIÓN\)' \}\);/,
    "res.json({ available: isUpdateAvailable, version: downloadedUpdateVersion });"
);
fs.writeFileSync('main.js', main);
console.log('Main restored.');
