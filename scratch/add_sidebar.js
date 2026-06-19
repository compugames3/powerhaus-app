const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/tom12/OneDrive/Escritorio/gimnasio';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const linkHtml = `
<a class="flex items-center gap-3 rounded-l-full ml-4 pl-4 py-3 transition-all duration-300 hover:translate-x-2 hover:bg-slate-200 group text-slate-500 dark:text-slate-400" href="cierre_mes.html">
<span class="material-symbols-outlined group-hover:scale-110 transition-all duration-300 notranslate" translate="no" style="font-variation-settings:'FILL' 1">calendar_month</span>
<span class="tracking-wider uppercase text-xs font-bold">Cierre del Mes</span>
</a>
`;

files.forEach(file => {
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add sidebar link
    let updated = false;
    
    // Find the "Cierre del Día" link
    const regex = /(<a[^>]*href="cierre\.html"[^>]*>[\s\S]*?<\/a>)/i;
    
    if (regex.test(content)) {
        if (!content.includes('href="cierre_mes.html"')) {
            content = content.replace(regex, `$1${linkHtml}`);
            updated = true;
        }
    }

    // 2. Remove the top-left logo next to search bar
    // It's a div with "Kinetic Precision" or "PowerHaus" and "ELITE PERFORMANCE"
    // Usually:
    // <div class="flex items-center gap-2.5"> ... <h1 class="...">PowerHaus</h1> ... <p class="...">ELITE PERFORMANCE</p> ... </div>
    // Let's remove the block:
    const logoRegex = /<div class="flex items-center gap-2\.5">[\s\S]*?<div class="w-8 h-8 bg-\[#0d4cf0\].*?[\s\S]*?<\/div>[\s\S]*?<div>[\s\S]*?<h1[^>]*>PowerHaus<\/h1>[\s\S]*?<p[^>]*>ELITE PERFORMANCE<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/g;
    
    if (logoRegex.test(content)) {
        content = content.replace(logoRegex, '');
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', file);
    }
});
