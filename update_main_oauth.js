const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// 1. Add googleapis import
if (!code.includes("require('googleapis')")) {
    code = code.replace("const crypto = require('crypto');", "const crypto = require('crypto');\nconst { google } = require('googleapis');");
}

// 2. Add Google Drive OAuth Logic
const oauthLogic = `
let driveOAuth2Client = null;

function getDriveClient() {
    try {
        if (!fs.existsSync('credentials.json')) {
            throw new Error('No se encontró credentials.json en la carpeta raíz.');
        }
        const creds = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
        const { client_id, client_secret, redirect_uris } = creds.web || creds.installed;
        
        driveOAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            'http://localhost:3000/oauth2callback'
        );

        // Check if we have a saved token
        if (fs.existsSync('token.json')) {
            driveOAuth2Client.setCredentials(JSON.parse(fs.readFileSync('token.json', 'utf8')));
        }
        
        return driveOAuth2Client;
    } catch (e) {
        throw new Error('Error de credenciales: ' + e.message);
    }
}

// OAuth Callback Route
serverApp.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (code && driveOAuth2Client) {
        try {
            const { tokens } = await driveOAuth2Client.getToken(code);
            driveOAuth2Client.setCredentials(tokens);
            fs.writeFileSync('token.json', JSON.stringify(tokens));
            res.send('<html><body><h1>Autenticación Completada</h1><p>Ya puedes cerrar esta ventana y volver a PowerHaus.</p><script>window.close()</script></body></html>');
            
            // If there's an active auth window, close it
            BrowserWindow.getAllWindows().forEach(win => {
                if (win.getTitle() === 'Google Sign In') {
                    win.close();
                }
            });
        } catch (e) {
            res.send('Error obteniendo el token: ' + e);
        }
    } else {
        res.send('No se proporcionó código de autenticación.');
    }
});
`;

if (!code.includes('let driveOAuth2Client = null;')) {
    code = code.replace("serverApp.get('/api/backup/save-dialog', async (req, res) => {", oauthLogic + "\n    serverApp.get('/api/backup/save-dialog', async (req, res) => {");
}

// 3. Rewrite save-dialog and open-dialog for 'drive' mode
const saveDialogReplacement = `
            if (mode === 'drive') {
                try {
                    const client = getDriveClient();
                    if (!fs.existsSync('token.json')) {
                        const authUrl = client.generateAuthUrl({
                            access_type: 'offline',
                            scope: ['https://www.googleapis.com/auth/drive.file']
                        });
                        
                        const authWindow = new BrowserWindow({
                            width: 600,
                            height: 800,
                            title: 'Google Sign In',
                            webPreferences: { nodeIntegration: false }
                        });
                        authWindow.loadURL(authUrl);
                        return res.json({ success: false, error: 'Por favor, inicia sesión en la ventana que se abrió e intenta nuevamente.' });
                    }
                    
                    const drive = google.drive({ version: 'v3', auth: client });
                    const payload = JSON.stringify({
                        timestamp: new Date().toISOString(),
                        users: readDB(),
                        classes: readClasses()
                    });
                    const encrypted = encrypt(payload);
                    const tempPath = path.join(os.tmpdir(), defaultFilename);
                    fs.writeFileSync(tempPath, encrypted);
                    
                    const fileMetadata = { name: defaultFilename };
                    const media = {
                        mimeType: 'application/octet-stream',
                        body: fs.createReadStream(tempPath)
                    };
                    
                    await drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    });
                    
                    fs.unlinkSync(tempPath);
                    return res.json({ success: true, filePath: 'Google Drive' });
                } catch (e) {
                    return res.json({ success: false, error: 'Error de Drive: ' + e.message });
                }
            }
`;

if (!code.includes('drive.files.create')) {
    // Find where the drive logic is
    code = code.replace(
        "if (mode === 'drive') {\n                // Attempt to find Google Drive\n                const possiblePaths = [\n                    'G:\\\\\\\\Mi unidad',\n                    'G:\\\\\\\\My Drive',\n                    path.join(os.homedir(), 'Google Drive'),\n                    path.join(os.homedir(), 'GoogleDrive')\n                ];\n                for (const p of possiblePaths) {\n                    if (fs.existsSync(p)) {\n                        defaultPath = path.join(p, defaultFilename);\n                        break;\n                    }\n                }\n            }",
        saveDialogReplacement
    );
}

const openDialogReplacement = `
            if (mode === 'drive') {
                try {
                    const client = getDriveClient();
                    if (!fs.existsSync('token.json')) {
                        const authUrl = client.generateAuthUrl({
                            access_type: 'offline',
                            scope: ['https://www.googleapis.com/auth/drive.file']
                        });
                        
                        const authWindow = new BrowserWindow({
                            width: 600,
                            height: 800,
                            title: 'Google Sign In',
                            webPreferences: { nodeIntegration: false }
                        });
                        authWindow.loadURL(authUrl);
                        return res.json({ success: false, error: 'Por favor, inicia sesión en la ventana que se abrió e intenta nuevamente.' });
                    }
                    
                    const drive = google.drive({ version: 'v3', auth: client });
                    const response = await drive.files.list({
                        q: "name contains '.phbak' and trashed = false",
                        orderBy: 'createdTime desc',
                        pageSize: 1,
                        fields: 'files(id, name)'
                    });
                    
                    const files = response.data.files;
                    if (files.length === 0) {
                        return res.json({ success: false, error: 'No se encontraron copias de seguridad (.phbak) en tu Google Drive.' });
                    }
                    
                    const fileId = files[0].id;
                    const destPath = path.join(os.tmpdir(), 'downloaded.phbak');
                    
                    const resDrive = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' });
                    
                    await new Promise((resolve, reject) => {
                        const dest = fs.createWriteStream(destPath);
                        resDrive.data.pipe(dest);
                        resDrive.data.on('end', resolve);
                        resDrive.data.on('error', reject);
                    });
                    
                    const encryptedPayload = fs.readFileSync(destPath, 'utf8');
                    const decrypted = decrypt(encryptedPayload);
                    if (!decrypted) throw new Error('Invalid encryption or corrupted file');
                    
                    const data = JSON.parse(decrypted);
                    if (data.users) writeDB(data.users);
                    if (data.classes) writeClasses(data.classes);
                    
                    fs.unlinkSync(destPath);
                    return res.json({ success: true, filePath: 'Google Drive' });
                    
                } catch (e) {
                    return res.json({ success: false, error: 'Error de Drive: ' + e.message });
                }
            }
`;

if (!code.includes('drive.files.list')) {
    code = code.replace(
        "if (mode === 'drive') {\n                const possiblePaths = [\n                    'G:\\\\\\\\Mi unidad',\n                    'G:\\\\\\\\My Drive',\n                    path.join(os.homedir(), 'Google Drive'),\n                    path.join(os.homedir(), 'GoogleDrive')\n                ];\n                for (const p of possiblePaths) {\n                    if (fs.existsSync(p)) {\n                        defaultPath = p;\n                        break;\n                    }\n                }\n            }",
        openDialogReplacement
    );
}

fs.writeFileSync('main.js', code);
console.log('Backend main.js updated for Drive OAuth2');
