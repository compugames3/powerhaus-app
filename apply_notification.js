const fs = require('fs');

// 1. Modificar package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.clean = "rimraf dist";
pkg.scripts.publish = "npm run clean && electron-builder --publish always";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
console.log('Patched package.json');

// 2. Modificar main.js
let main = fs.readFileSync('main.js', 'utf8');

// Buscamos si ya hemos insertado el endpoint
if (!main.includes("serverApp.get('/api/update-status'")) {
    const updateLogicState = `
// --- ESTADO DE ACTUALIZACIONES ---
let isUpdateAvailable = false;
let downloadedUpdateVersion = null;

autoUpdater.on('update-available', (info) => {
    isUpdateAvailable = true;
});

autoUpdater.on('update-downloaded', (info) => {
    isUpdateAvailable = true;
    downloadedUpdateVersion = info.version;
});

serverApp.get('/api/update-status', (req, res) => {
    res.json({ available: isUpdateAvailable, version: downloadedUpdateVersion });
});
`;

    main = main.replace("const serverApp = express();", "const serverApp = express();\n" + updateLogicState);
    fs.writeFileSync('main.js', main);
    console.log('Patched main.js');
}

// 3. Modificar theme-applier.js
let themeApplier = fs.readFileSync('theme-applier.js', 'utf8');

if (!themeApplier.includes("checkUpdateBadge")) {
    const badgeLogic = `
// --- UPDATE NOTIFICATION LOGIC ---
async function checkUpdateBadge() {
    try {
        const res = await fetch('/api/update-status');
        const data = await res.json();
        
        if (data.available) {
            document.querySelectorAll('span.material-symbols-outlined').forEach(span => {
                if (span.textContent.trim() === 'notifications' || span.getAttribute('data-icon') === 'notifications') {
                    const btn = span.closest('button') || span.parentElement;
                    if (btn && !btn.querySelector('#update-badge-indicator')) {
                        btn.style.position = 'relative';
                        const badge = document.createElement('span');
                        badge.id = 'update-badge-indicator';
                        badge.className = 'absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm z-50 animate-pulse';
                        btn.appendChild(badge);
                        
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Actualización Disponible',
                                    text: data.version ? \`La versión \${data.version} está descargada. Se instalará automáticamente al cerrar el programa.\` : 'Se está descargando una nueva actualización en segundo plano.',
                                    confirmButtonColor: '#3b82f6',
                                    confirmButtonText: 'Entendido'
                                });
                            } else {
                                alert(data.version ? \`La versión \${data.version} está lista para instalar.\` : 'Actualización en progreso...');
                            }
                        });
                    }
                }
            });
        }
    } catch (e) {
        // Ignorar si falla la conexión local
    }
}

// Ejecutar al cargar y cada 2 minutos
document.addEventListener('DOMContentLoaded', () => {
    checkUpdateBadge();
    setInterval(checkUpdateBadge, 120000);
});
`;
    themeApplier += '\n' + badgeLogic;
    fs.writeFileSync('theme-applier.js', themeApplier);
    console.log('Patched theme-applier.js');
}
