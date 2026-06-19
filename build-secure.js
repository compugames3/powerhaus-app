const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { execSync } = require('child_process');

console.log("Reading main.js...");
const code = fs.readFileSync('main.js', 'utf8');

console.log("Obfuscating...");
const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    target: 'node',
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    disableConsoleOutput: true
}).getObfuscatedCode();

fs.writeFileSync('main-obf.js', obfuscatedCode);
console.log("Saved to main-obf.js");

console.log("Updating package.json...");
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const originalMain = pkg.main;
pkg.main = 'main-obf.js';
// Bump version
const verParts = pkg.version.split('.');
pkg.version = `${verParts[0]}.${verParts[1]}.${parseInt(verParts[2]) + 1}`;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));

try {
    console.log("Running electron-builder...");
    execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
    console.error("Build failed!", e);
} finally {
    console.log("Reverting package.json...");
    pkg.main = originalMain;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
    
    console.log("Removing main-obf.js...");
    if (fs.existsSync('main-obf.js')) fs.unlinkSync('main-obf.js');
    console.log("Secure build complete.");
}
