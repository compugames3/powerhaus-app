const fs = require('fs');
let html = fs.readFileSync('temas.html', 'utf8');

// Fix the template literal syntax errors
html = html.replace(/setFont\('[\s\S]*?'\)/, "setFont('${f.name}')");
html = html.replace(/font-family:'[\s\S]*?',sans-serif/, "font-family:'${f.name}',sans-serif");
html = html.replace(/link\[href\*=\"[\s\S]*?\"\]/, "link[href*=\"fonts.googleapis.com\"]");

fs.writeFileSync('temas.html', html);
