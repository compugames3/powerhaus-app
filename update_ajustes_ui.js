const fs = require('fs');
let html = fs.readFileSync('ajustes.html', 'utf8');

// 1. Change button onclicks
html = html.replace('onclick="descargarRespaldo()"', 'onclick="openBackupModal()"');
html = html.replace("onclick=\"document.getElementById('restoreInput').click()\"", 'onclick="openRestoreModal()"');

// 2. Add Modals HTML right before </body>
const modalsHtml = `
<!-- Backup Modal -->
<div id="backupModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-95 transition-transform duration-300" id="backupModalContent">
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Guardar Copia de Seguridad</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Elige dónde quieres guardar el archivo encriptado .phbak con todos los datos de tu gimnasio.</p>
        
        <div class="flex flex-col gap-3">
            <button onclick="executeBackup('local')" class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <span class="material-symbols-outlined">computer</span>
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm">Modo Local</h4>
                    <p class="text-xs text-slate-500">Guardar en tu PC (Descargas, Documentos...)</p>
                </div>
            </button>
            
            <button onclick="executeBackup('drive')" class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" class="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" alt="Drive">
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm">Google Drive</h4>
                    <p class="text-xs text-slate-500">Busca automáticamente tu unidad de Drive</p>
                </div>
            </button>
        </div>
        
        <button onclick="closeBackupModal()" class="mt-6 w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
    </div>
</div>

<!-- Restore Modal -->
<div id="restoreModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-95 transition-transform duration-300" id="restoreModalContent">
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Restaurar Copia de Seguridad</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Selecciona de dónde quieres cargar el archivo .phbak. La sesión se cerrará tras restaurar.</p>
        
        <div class="flex flex-col gap-3">
            <button onclick="executeRestore('local')" class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-left group">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    <span class="material-symbols-outlined">folder_open</span>
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm">Modo Local</h4>
                    <p class="text-xs text-slate-500">Buscar en tu disco duro local</p>
                </div>
            </button>
            
            <button onclick="executeRestore('drive')" class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" class="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" alt="Drive">
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm">Google Drive</h4>
                    <p class="text-xs text-slate-500">Buscar en tu unidad de Drive vinculada</p>
                </div>
            </button>
        </div>
        
        <button onclick="closeRestoreModal()" class="mt-6 w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
    </div>
</div>
`;

if (!html.includes('backupModal')) {
    html = html.replace('</body>', modalsHtml + '\n</body>');
}

// 3. Add JS functions
const jsFunctions = `
// MODALS LOGIC
function openBackupModal() {
    const m = document.getElementById('backupModal');
    const c = document.getElementById('backupModalContent');
    m.classList.remove('hidden');
    // slight delay for animation
    setTimeout(() => {
        m.classList.remove('opacity-0');
        c.classList.remove('scale-95');
    }, 10);
}

function closeBackupModal() {
    const m = document.getElementById('backupModal');
    const c = document.getElementById('backupModalContent');
    m.classList.add('opacity-0');
    c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); }, 300);
}

function openRestoreModal() {
    const m = document.getElementById('restoreModal');
    const c = document.getElementById('restoreModalContent');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        c.classList.remove('scale-95');
    }, 10);
}

function closeRestoreModal() {
    const m = document.getElementById('restoreModal');
    const c = document.getElementById('restoreModalContent');
    m.classList.add('opacity-0');
    c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); }, 300);
}

// EXECUTION LOGIC
async function executeBackup(mode) {
    closeBackupModal();
    showToast('Abriendo explorador...');
    try {
        const res = await fetch('/api/backup/save-dialog?mode=' + mode);
        const data = await res.json();
        if (data.success) {
            showToast('✅ Copia de seguridad guardada exitosamente');
        } else if (data.canceled) {
            showToast('Operación cancelada');
        } else {
            showToast('❌ Error: ' + (data.error || 'Desconocido'));
        }
    } catch(e) {
        alert('Error conectando con el sistema local: ' + e);
    }
}

async function executeRestore(mode) {
    closeRestoreModal();
    showToast('Abriendo explorador...');
    try {
        const res = await fetch('/api/backup/open-dialog?mode=' + mode);
        const data = await res.json();
        if (data.success) {
            showToast('✅ Copia restaurada correctamente. Reiniciando...');
            setTimeout(() => {
                window.parent.location.href = 'login-software.html';
            }, 1500);
        } else if (data.canceled) {
            showToast('Operación cancelada');
        } else {
            showToast('❌ Error: ' + (data.error || 'Desconocido'));
        }
    } catch(e) {
        alert('Error conectando con el sistema local: ' + e);
    }
}
`;

if (!html.includes('executeBackup(mode)')) {
    html = html.replace('</script>\n</body>', jsFunctions + '\n</script>\n</body>');
}

fs.writeFileSync('ajustes.html', html);
console.log('UI updated.');
