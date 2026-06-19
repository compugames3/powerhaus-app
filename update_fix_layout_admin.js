const fs = require('fs');

// --- 1. Fix Admin permissions in editar_usuario.html ---
let editarHtml = fs.readFileSync('editar_usuario.html', 'utf8');

const setRoleLogic = `
function setRole(role) {
    currentRole = role;
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
        card.className = "role-card bg-[#f8f9fc] border border-transparent rounded-xl p-4 cursor-pointer hover:bg-[#f1f4fb] transition-colors";
        let h4 = card.querySelector('h4');
        if(h4) h4.className = "font-bold text-sm text-slate-800 mb-1";
    });
    
    let activeCard = document.getElementById('role-' + role);
    if(activeCard) {
        activeCard.className = "role-card bg-[#edf2fc] border border-[#a2bcf5] rounded-xl p-4 cursor-pointer transition-colors active-role";
        let h4 = activeCard.querySelector('h4');
        if(h4) h4.className = "font-bold text-sm text-[#003ec7] mb-1";
    }

    if (!window.isAutoFilling) {
        const permsCheckboxes = document.querySelectorAll('.perm-option');
        
        permsCheckboxes.forEach(el => {
            let isChecked = el.getAttribute('data-checked') === 'true';
            let shouldBeChecked = false;

            if (role === 'Admin') {
                shouldBeChecked = true; // Admin gets everything
            } else {
                // For other roles, don't auto-check everything, let user decide or set defaults
                let permName = el.querySelector('span') ? el.querySelector('span').innerText.trim() : el.innerText.trim();
                let defaults = ['Gestionar Miembros', 'Editar Horarios', 'Reserva de Clases'];
                shouldBeChecked = defaults.includes(permName);
            }

            if (shouldBeChecked && !isChecked) {
                // click to check
                el.click();
            } else if (!shouldBeChecked && isChecked) {
                // click to uncheck
                el.click();
            }
        });
    }
}
`;

editarHtml = editarHtml.replace(/function setRole\(role\) \{[\s\S]*?(?=\nfunction setPerm\()/, setRoleLogic + '\n');

fs.writeFileSync('editar_usuario.html', editarHtml);

// Also patch utf-8 if needed
if (fs.existsSync('editar_usuario_utf8.html')) {
    let utf8Html = fs.readFileSync('editar_usuario_utf8.html', 'utf8');
    utf8Html = utf8Html.replace(/function setRole\(role\) \{[\s\S]*?(?=\nfunction setPerm\()/, setRoleLogic + '\n');
    fs.writeFileSync('editar_usuario_utf8.html', utf8Html);
}

// --- 2. Fix layout in nuevo_miembro.html ---
let nuevoHtml = fs.readFileSync('nuevo_miembro.html', 'utf8');

const oldLayout = `
                    </div>
                </div>
                <!-- Extra Measurements Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
`;

// Replace the end of the first grid and start of the second to just merge them
nuevoHtml = nuevoHtml.replace(oldLayout, '');

// If the user hasn't seen the updated file, the previous replacement added an extra closing </div> that needs to be removed.
// Let's re-parse it correctly: we want one grid with 6 elements.
const gridStartRegex = /<div class="grid grid-cols-1 md:grid-cols-3 gap-6">([\s\S]*?)<\/select>\s*<\/div>/;

// We will recreate the physical profile grid completely to ensure order
const newPhysicalProfileGrid = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">ALTURA (CM)</label>
                        <input type="number" id="altura-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium" placeholder="185" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">PESO (KG)</label>
                        <input type="number" id="peso-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium" placeholder="82" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">ESTADO FÍSICO</label>
                        <select id="estado-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium appearance-none">
                            <option>Seleccionar</option>
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Medidas de brazos (CM)</label>
                        <input type="number" id="brazos-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium" placeholder="Ej. 35" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Medidas de cintura (CM)</label>
                        <input type="number" id="cintura-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium" placeholder="Ej. 80" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Medidas de piernas (CM)</label>
                        <input type="number" id="piernas-cliente" class="w-full soft-input rounded-xl px-4 py-3 text-sm text-slate-800 font-medium" placeholder="Ej. 60" />
                    </div>
                </div>
`;

// Replace the entire block from the start of the grid up to the end of the second grid or the end of the first grid
const fullGridMatch = /<div class="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?placeholder="Ej\. 60" \/>\s*<\/div>\s*<\/div>/;

if (nuevoHtml.match(fullGridMatch)) {
    nuevoHtml = nuevoHtml.replace(fullGridMatch, newPhysicalProfileGrid);
} else {
    // Fallback if the first regex didn't match perfectly
    const fallbackMatch = /<div class="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;
    nuevoHtml = nuevoHtml.replace(fallbackMatch, newPhysicalProfileGrid);
}

fs.writeFileSync('nuevo_miembro.html', nuevoHtml);

console.log('Patch complete.');
