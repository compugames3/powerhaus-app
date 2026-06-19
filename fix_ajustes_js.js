const fs = require('fs');

let html = fs.readFileSync('ajustes.html', 'utf8');

const js = `
<script>
function openBackupModal() {
    const m = document.getElementById('backupModal');
    const c = document.getElementById('backupModalContent');
    m.classList.remove('hidden');
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
</script>
`;

if (!html.includes('function openBackupModal()')) {
    html = html.replace('</body>', js + '\n</body>');
    fs.writeFileSync('ajustes.html', html);
    console.log('Fixed JS injected!');
} else {
    console.log('Already exists');
}
