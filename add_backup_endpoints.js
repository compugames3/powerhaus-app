const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const backupEndpoints = `
    serverApp.get('/api/backup/save-dialog', async (req, res) => {
        try {
            const mode = req.query.mode || 'local';
            const dateStr = new Date().toISOString().split('T')[0];
            const defaultFilename = \`powerhaus_secure_backup_\${dateStr}.phbak\`;
            
            let defaultPath = defaultFilename;
            if (mode === 'drive') {
                // Attempt to find Google Drive
                const possiblePaths = [
                    'G:\\\\Mi unidad',
                    'G:\\\\My Drive',
                    path.join(os.homedir(), 'Google Drive'),
                    path.join(os.homedir(), 'GoogleDrive')
                ];
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        defaultPath = path.join(p, defaultFilename);
                        break;
                    }
                }
            }

            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
                title: mode === 'drive' ? 'Guardar en Google Drive' : 'Guardar Copia de Seguridad Local',
                defaultPath: defaultPath,
                filters: [
                    { name: 'PowerHaus Backup', extensions: ['phbak'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled || !filePath) {
                return res.json({ success: false, canceled: true });
            }

            const payload = JSON.stringify({
                timestamp: new Date().toISOString(),
                users: readDB(),
                classes: readClasses()
            });
            const encrypted = encrypt(payload);
            fs.writeFileSync(filePath, encrypted);
            res.json({ success: true, filePath });
        } catch(e) {
            console.error('Backup save error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    serverApp.get('/api/backup/open-dialog', async (req, res) => {
        try {
            const mode = req.query.mode || 'local';
            let defaultPath = undefined;
            
            if (mode === 'drive') {
                const possiblePaths = [
                    'G:\\\\Mi unidad',
                    'G:\\\\My Drive',
                    path.join(os.homedir(), 'Google Drive'),
                    path.join(os.homedir(), 'GoogleDrive')
                ];
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        defaultPath = p;
                        break;
                    }
                }
            }

            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                title: mode === 'drive' ? 'Restaurar desde Google Drive' : 'Restaurar Copia de Seguridad Local',
                defaultPath: defaultPath,
                properties: ['openFile'],
                filters: [
                    { name: 'PowerHaus Backup', extensions: ['phbak'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled || filePaths.length === 0) {
                return res.json({ success: false, canceled: true });
            }

            const encryptedPayload = fs.readFileSync(filePaths[0], 'utf8');
            const decrypted = decrypt(encryptedPayload);
            if (!decrypted) throw new Error('Invalid encryption or corrupted file');
            
            const data = JSON.parse(decrypted);
            if (data.users) writeDB(data.users);
            if (data.classes) writeClasses(data.classes);
            
            res.json({ success: true, filePath: filePaths[0] });
        } catch(e) {
            console.error('Backup restore error:', e);
            res.status(500).json({ error: 'Error al restaurar: archivo inválido o corrupto.' });
        }
    });
`;

if (!code.includes('/api/backup/save-dialog')) {
    code = code.replace(
        "serverApp.get('/api/backup/download', (req, res) => {",
        backupEndpoints + "\n    serverApp.get('/api/backup/download', (req, res) => {"
    );
    fs.writeFileSync('main.js', code);
    console.log('Endpoints added.');
} else {
    console.log('Endpoints already exist.');
}
