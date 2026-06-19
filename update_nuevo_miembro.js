const fs = require('fs');

let html = fs.readFileSync('nuevo_miembro.html', 'utf8');

// 1. Inject the new physical fields
const physicalFieldsRegex = /<label class="block text-\[10px\] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">ESTADO FÍSICO<\/label>[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;
const newFields = `
                    </div>
                </div>
                <!-- Extra Measurements Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
html = html.replace(physicalFieldsRegex, match => {
    return match.replace(/<\/div>$/, '') + newFields;
});

// 2. Add IDs and onchange to radio buttons and labels
html = html.replace('<label class="block w-full border border-blue-200 bg-blue-50/50 rounded-2xl p-4 mb-3 cursor-pointer hover:border-blue-400 shadow-sm transition-all relative">', 
                    '<label id="label-plan1" class="block w-full border border-blue-200 bg-blue-50/50 rounded-2xl p-4 mb-3 cursor-pointer hover:border-blue-400 shadow-sm transition-all relative">');
html = html.replace('<input type="radio" name="plan" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-600" checked />',
                    '<input type="radio" name="plan" id="radio-plan1" onchange="updatePlanUI()" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-600" checked />');

html = html.replace('<label class="block w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 mb-8 cursor-pointer hover:border-slate-200 transition-all relative group">',
                    '<label id="label-plan2" class="block w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 mb-8 cursor-pointer hover:border-slate-200 transition-all relative group">');
html = html.replace('<input type="radio" name="plan" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-600" />',
                    '<input type="radio" name="plan" id="radio-plan2" onchange="updatePlanUI()" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-600" />');

// 3. Update saveMember to save the new fields
if (!html.includes('const brazos = document.getElementById')) {
    html = html.replace("const peso = document.getElementById('peso-cliente').value.trim();",
                        "const peso = document.getElementById('peso-cliente').value.trim();\n        const brazos = document.getElementById('brazos-cliente') ? document.getElementById('brazos-cliente').value.trim() : '';\n        const cintura = document.getElementById('cintura-cliente') ? document.getElementById('cintura-cliente').value.trim() : '';\n        const piernas = document.getElementById('piernas-cliente') ? document.getElementById('piernas-cliente').value.trim() : '';");

    html = html.replace("weight: peso || \"\",", "weight: peso || \"\",\n                arms: brazos || \"\",\n                waist: cintura || \"\",\n                legs: piernas || \"\",");
    html = html.replace("weight: peso || \"\",", "weight: peso || \"\",\n                arms: brazos || \"\",\n                waist: cintura || \"\",\n                legs: piernas || \"\","); // Replace second occurrence
}

// 4. Update the isEditMode population to load the values if present
if (!html.includes('if(document.getElementById(\'brazos-cliente\')) document.getElementById(\'brazos-cliente\').value')) {
    html = html.replace("if(document.getElementById('peso-cliente')) document.getElementById('peso-cliente').value = usr.weight || \"\";",
                        "if(document.getElementById('peso-cliente')) document.getElementById('peso-cliente').value = usr.weight || \"\";\n                if(document.getElementById('brazos-cliente')) document.getElementById('brazos-cliente').value = usr.arms || \"\";\n                if(document.getElementById('cintura-cliente')) document.getElementById('cintura-cliente').value = usr.waist || \"\";\n                if(document.getElementById('piernas-cliente')) document.getElementById('piernas-cliente').value = usr.legs || \"\";");
}

// 5. Inject updatePlanUI function
const scriptInjection = `
    function updatePlanUI() {
        const p1 = document.getElementById('radio-plan1');
        const p2 = document.getElementById('radio-plan2');
        const l1 = document.getElementById('label-plan1');
        const l2 = document.getElementById('label-plan2');
        const n1 = document.getElementById('config-plan1-name');
        const n2 = document.getElementById('config-plan2-name');

        if (p1 && p1.checked) {
            if (l1) { l1.className = "block w-full border border-blue-200 bg-blue-50/50 rounded-2xl p-4 mb-3 cursor-pointer hover:border-blue-400 shadow-sm transition-all relative"; }
            if (l2) { l2.className = "block w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 mb-8 cursor-pointer hover:border-slate-200 transition-all relative group"; }
            if (n1) { n1.classList.add('text-blue-800'); n1.classList.remove('text-slate-700'); }
            if (n2) { n2.classList.remove('text-blue-800'); n2.classList.add('text-slate-700'); }
        } else if (p2 && p2.checked) {
            if (l2) { l2.className = "block w-full border border-blue-200 bg-blue-50/50 rounded-2xl p-4 mb-8 cursor-pointer hover:border-blue-400 shadow-sm transition-all relative"; }
            if (l1) { l1.className = "block w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 mb-3 cursor-pointer hover:border-slate-200 transition-all relative group"; }
            if (n2) { n2.classList.add('text-blue-800'); n2.classList.remove('text-slate-700'); }
            if (n1) { n1.classList.remove('text-blue-800'); n1.classList.add('text-slate-700'); }
        }
    }
`;
if (!html.includes('function updatePlanUI()')) {
    html = html.replace('function toggleEditPlans() {', scriptInjection + '\n    function toggleEditPlans() {');
}

// 6. Ensure updatePlanUI is called on initialization
if (!html.includes('updatePlanUI();')) {
    html = html.replace("const savedPlanes = JSON.parse(localStorage.getItem('configPlanes') || 'null');", "updatePlanUI();\n        const savedPlanes = JSON.parse(localStorage.getItem('configPlanes') || 'null');");
}

fs.writeFileSync('nuevo_miembro.html', html);
console.log('Done patching nuevo_miembro.html');
