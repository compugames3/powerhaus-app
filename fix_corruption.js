const fs = require('fs');

let html = fs.readFileSync('temas.html', 'utf8');

// 1. Remove duplicate JS blocks
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
}`;

// Replace all instances of the block with a placeholder, then put ONE back.
let parts = html.split('/* Branding logic */');
if (parts.length > 2) {
    // Only keep the first part (before first occurrence) and the last part (after last occurrence), and stitch one block in between?
    // Safer regex:
    html = html.replace(new RegExp(jsBlock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g'), '');
    // Insert it once before /* Toast */
    html = html.replace('/* Toast */', jsBlock + '\n\n/* Toast */');
}

// 2. Remove duplicate initBrandInputs() call
html = html.replace('initBrandInputs();\ninitBrandInputs();', 'initBrandInputs();');

// 3. Remove duplicate HTML sections
const htmlSection = `        <!-- BRANDING ------------------------------------------- -->
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

// Regex to remove all copies and add just one
const secRegex = new RegExp(htmlSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g');
html = html.replace(secRegex, '');
// Re-insert right after Theme Mode section
html = html.replace('<!-- BRANDING ------------------------------------------- -->', ''); // Just in case
html = html.replace('        <!-- COLOR ACCENT', htmlSection + '\n\n        <!-- COLOR ACCENT');

// 4. Fix Mojibake
html = html.replace(/ï¿½/g, '•'); // For Inter ï¿½ 14px -> Inter • 14px
html = html.replace(/Estï¿½tica/g, 'Estética');
html = html.replace(/Diseï¿½o/g, 'Diseño');
html = html.replace(/ï¿½ptimo/g, 'óptimo');
html = html.replace(/ðŸ¤–/g, '🤖');
html = html.replace(/âœ…/g, '✅');
html = html.replace(/Diseï¿½o/g, 'Diseño'); // Double check
html = html.replace(/ï¿½/g, 'í'); // Any remaining ï¿½ might be í or something else, but I already replaced •

fs.writeFileSync('temas.html', html);
console.log("Cleanup done.");
