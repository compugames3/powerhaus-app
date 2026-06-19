const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // We want to replace <span class="...">Personal</span> with <span class="...">Productos</span>
    // But since the user wants PRODUCTOS uppercase or capitalized, the original is 'Personal'.
    // We will do a generic replacement of `>Personal</span>` to `>Productos</span>`
    // Wait, the screenshot shows "PERSONAL" in uppercase, but the HTML says "Personal". 
    // The CSS class "uppercase" makes it look uppercase. So I'll just change "Personal" to "Productos".
    let newContent = content.replace(/>Personal<\/span>/g, '>Productos</span>');
    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    }
});
