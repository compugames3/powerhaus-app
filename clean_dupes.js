const fs = require('fs');
let html = fs.readFileSync('temas.html', 'utf8');

const p1 = html.split('/* Branding logic */')[0];
const p2 = html.split('/* Toast */').pop();

const jsBlock = `/* Branding logic */
function updateBrandPreview() {
    const title = document.getElementById('brandTitleInput').value || 'PowerHaus';
    const sub = document.getElementById('brandSubtitleInput').value || 'ELITE PERFORMANCE';
    let pTitle = document.getElementById('pvBrandTitle');
    let pSub = document.getElementById('pvBrandSubtitle');
    if(pTitle) pTitle.innerText = title;
    if(pSub) pSub.innerText = sub;
    localStorage.setItem('powerhaus_brand_title', title);
    localStorage.setItem('powerhaus_brand_subtitle', sub);
    if (window.applyBrandText) window.applyBrandText();
}
function initBrandInputs() {
    const sTitle = localStorage.getItem('powerhaus_brand_title');
    const sSub = localStorage.getItem('powerhaus_brand_subtitle');
    const bInTitle = document.getElementById('brandTitleInput');
    const bInSub = document.getElementById('brandSubtitleInput');
    let pTitle = document.getElementById('pvBrandTitle');
    let pSub = document.getElementById('pvBrandSubtitle');
    if(sTitle) { if(bInTitle) bInTitle.value = sTitle; if(pTitle) pTitle.innerText = sTitle; }
    if(sSub) { if(bInSub) bInSub.value = sSub; if(pSub) pSub.innerText = sSub; }
}

/* Toast */`;

html = p1 + jsBlock + p2;

// Now HTML block duplicates:
const secHTML = `        <!-- BRANDING ------------------------------------------- -->
        <section class="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-sm border border-slate-100 dark:border-slate-800 fade-up">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Identidad de Marca</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">TÍTULO PRINCIPAL</label>
                <input type="text" id="brandTitleInput" value="PowerHaus" class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none transition-all" oninput="updateBrandPreview()"/>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">SUBTÍTULO</label>
                <input type="text" id="brandSubtitleInput" value="ELITE PERFORMANCE" class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none transition-all" oninput="updateBrandPreview()"/>
            </div>
          </div>
        </section>`;

// Split by this block and keep only the first split, then add one back before COLOR ACCENT
let hparts = html.split('<!-- BRANDING ------------------------------------------- -->');
if(hparts.length > 2) {
    // Keep everything before the first one
    let firstPart = hparts[0];
    // Find the COLOR ACCENT comment which is immediately after it
    let lastPartStr = html.substring(html.indexOf('<!-- COLOR ACCENT'));
    html = firstPart + secHTML + '\n\n        ' + lastPartStr;
}

// Remove any remaining `initBrandInputs();\ninitBrandInputs();`
html = html.replace(/initBrandInputs\(\);\s*initBrandInputs\(\);/g, 'initBrandInputs();');

fs.writeFileSync('temas.html', html);
