const fs = require('fs');

// --- 1. Patch package.json ---
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.build = pkg.build || {};
pkg.build.publish = [
    {
        provider: "github",
        owner: "compugames3",
        repo: "powerhaus-app"
    }
];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
console.log('Patched package.json');

// --- 2. Patch main.js ---
let main = fs.readFileSync('main.js', 'utf8');

if (!main.includes("const { autoUpdater } = require('electron-updater');")) {
    main = main.replace(
        "const { app, BrowserWindow, shell, screen, dialog } = require('electron');",
        "const { app, BrowserWindow, shell, screen, dialog } = require('electron');\nconst { autoUpdater } = require('electron-updater');"
    );
}

const updaterLogic = `
    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
        // We can just wait for downloaded
    });

    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Actualización lista',
            message: 'Hay una nueva versión (' + info.version + ') de PowerHaus lista para instalar. ¿Deseas reiniciar la aplicación y aplicarla ahora?',
            buttons: ['Reiniciar y Actualizar', 'Más tarde']
        }).then((buttonIndex) => {
            if (buttonIndex.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
`;

// Insert the updater logic right after app.on('ready', createWindow);
if (!main.includes("autoUpdater.checkForUpdatesAndNotify()")) {
    main = main.replace(
        "app.on('ready', createWindow);",
        "app.on('ready', createWindow);\n" + updaterLogic
    );
}

fs.writeFileSync('main.js', main);
console.log('Patched main.js');
