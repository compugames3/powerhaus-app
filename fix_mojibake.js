const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
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
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Replace — with —
    content = content.replace(/—/g, '—');
    // Replace – with –
    content = content.replace(/–/g, '–');
    
    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed mojibake in', f);
    }
});
