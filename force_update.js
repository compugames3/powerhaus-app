const fs = require('fs');

let main = fs.readFileSync('main.js', 'utf8');

// Replace the update-status route to force it to true
main = main.replace(
    /res\.json\(\{ available: isUpdateAvailable, version: downloadedUpdateVersion \}\);/,
    "res.json({ available: true, version: '3.0.0 (SIMULACIÓN)' });"
);

fs.writeFileSync('main.js', main);
console.log('Main patched for simulation.');
