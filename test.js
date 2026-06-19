const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(process.cwd());
let errors = 0;

console.log('--- Iniciando Testeo Profesional ---');

files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const isHtml = f.endsWith('.html');
    
    if (isHtml) {
        // Count div tags
        const openDivs = (content.match(/<div\b/gi) || []).length;
        const closeDivs = (content.match(/<\/div>/gi) || []).length;
        if (openDivs !== closeDivs) {
            console.log(`[HTML WARN] ${path.basename(f)}: <div> mismatch! Open: ${openDivs}, Close: ${closeDivs}`);
            errors++;
        }
        
        // Count span tags
        const openSpans = (content.match(/<span\b/gi) || []).length;
        const closeSpans = (content.match(/<\/span>/gi) || []).length;
        if (openSpans !== closeSpans) {
            console.log(`[HTML WARN] ${path.basename(f)}: <span> mismatch! Open: ${openSpans}, Close: ${closeSpans}`);
            errors++;
        }
    } else {
        // Validate JS
        try {
            cp.execSync(`node -c "${f}"`, { stdio: 'ignore' });
        } catch (e) {
            console.log(`[JS ERROR] ${path.basename(f)}: Error de sintaxis.`);
            errors++;
        }
    }
});

console.log(`--- Testeo finalizado con ${errors} alertas ---`);
