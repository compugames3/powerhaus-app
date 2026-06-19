const { app, BrowserWindow, shell, screen, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { google } = require('googleapis');
const os = require('os');
const { Pool } = require('pg');
const net = require('net');

// ╔══════════════════════════════════════════════════════════════╗
// ║         ADN ÚNICO DE POWERHAUS — NO MODIFICAR               ║
// ║  Este UUID es el identificador biológico de la aplicación.  ║
// ║  Cambiarlo invalida TODOS los archivos de datos existentes. ║
// ╚══════════════════════════════════════════════════════════════╝
const PH_APP_UUID     = 'ph-cg3-7f4a1b2e-9d8c-4e5f-a0b1-2c3d4e5f6789';
const PH_PASSPHRASE   = 'PowerHaus_Secure_AntiHack_2026';
// Clave AES derivada del UUID + passphrase (HMAC-SHA256) → imposible de replicar externamente
const ENCRYPTION_KEY  = crypto.createHmac('sha256', PH_APP_UUID).update(PH_PASSPHRASE).digest();
const IV_LENGTH       = 16;

// Firma binaria de 16 bytes grabada en cada archivo .phdata
// Si falta o no coincide, el archivo se rechaza silenciosamente
const PH_MAGIC_HEADER = Buffer.from('504857415553434732303236', 'hex'); // PHWAUSGC2026 en hex

const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_DRof8XLI4vep@ep-muddy-flower-apc505xr-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const neonPool = new Pool({
    connectionString: NEON_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const LICENSE_KEY_COLUMNS = ['license_key'];
const LICENSE_EMAIL_COLUMNS = ['email', 'correo'];
const LICENSE_ACTIVE_COLUMNS = ['active', 'activa'];
const LICENSE_USER_ID_COLUMNS = ['user_id', 'userId', 'uid'];

function firstExistingValue(row, columns) {
    for (const column of columns) {
        if (Object.prototype.hasOwnProperty.call(row, column) && row[column] !== null && row[column] !== undefined) {
            return row[column];
        }
    }
    return undefined;
}

function normalizeLicenseKey(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeLicenseKeyForCompare(value) {
    return normalizeLicenseKey(value).replace(/[^A-Z0-9]/g, '');
}

function normalizeLicenseKeyAmbiguous(value) {
    return normalizeLicenseKeyForCompare(value)
        .replace(/O/g, '0')
        .replace(/[IL]/g, '1');
}

function isTruthyDatabaseValue(value) {
    if (value === true) return true;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'active' || normalized === 'activa' || normalized === 'authorized' || normalized === 'autorizada';
}

async function findLicenseInNeon(licenseKey) {
    const normalizedKey = normalizeLicenseKey(licenseKey);

    const query = `
        SELECT * FROM usuarios
        WHERE licencia = $1
    `;
    const values = [normalizedKey];
    const result = await neonPool.query(query, values);
    return result.rows[0] || null;
}

async function validateLicenseInNeon(licenseKey, email) {
    const row = await findLicenseInNeon(licenseKey);
    if (!row) {
        return { ok: false, message: 'Clave de licencia no encontrada en Neon.' };
    }

    if (row.is_banned === true) {
        return { ok: false, message: 'Usuario baneado.' };
    }

    const dbEmail = String(row.correo || '').trim().toLowerCase();
    const userEmail = String(email || '').trim().toLowerCase();
    if (dbEmail && userEmail && dbEmail !== userEmail) {
        return { ok: false, message: 'La clave de licencia no pertenece a este correo.' };
    }

    const activeValue = row.licencia_status;
    if (activeValue === 'revocada') {
        return { ok: false, message: 'Esta licencia ha sido revocada por el administrador.' };
    }

    const dbLicenseKey = String(row.licencia || normalizeLicenseKey(licenseKey)).trim();
    const userId = String(row.id || dbEmail || userEmail || dbLicenseKey).trim();
    return { ok: true, userId, email: dbEmail || userEmail, licenseKey: normalizeLicenseKey(dbLicenseKey) };
}

async function registerInstalledProgramInNeon(license, machineInfo) {
    const licenseKey = normalizeLicenseKey(license?.licenseKey);
    const userId = String(license?.userId || '').trim();
    const email = String(license?.email || '').trim().toLowerCase();
    const pcSpecs = JSON.stringify(machineInfo || {});

    if (!licenseKey || !email) return;

    await neonPool.query({
        text: `
            UPDATE usuarios
            SET licencia_status = 'activada',
                licencia = $1,
                pc_specs = $2,
                programa_verificado = true,
                fecha_verificacion = NOW()
            WHERE id = $3 OR LOWER(correo) = $4
        `,
        values: [licenseKey, pcSpecs, isNaN(parseInt(userId)) ? 0 : parseInt(userId), email]
    });
}

function embedMagic(encryptedHex) {
    // Prefijo: magic_header_hex + '|' + payload
    return PH_MAGIC_HEADER.toString('hex') + '|' + encryptedHex;
}

function stripMagic(raw) {
    if (!raw) return null;
    const sep = raw.indexOf('|');
    if (sep === -1) return null; // Archivo sin cabecera → no es nuestro
    const magic = raw.substring(0, sep);
    if (magic !== PH_MAGIC_HEADER.toString('hex')) return null; // Firma incorrecta
    return raw.substring(sep + 1);
}

function encrypt(text) {
    if (!text) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return embedMagic(iv.toString('hex') + ':' + encrypted);
}

function decrypt(text) {
    if (!text) return null;
    // Compatibilidad: si ya tiene header, quitarlo; si no, intentar leer de todos modos (legacy)
    let payload = stripMagic(text);
    if (!payload) {
        // Legacy: archivos sin firma intentar descifrar de todas formas (migración)
        payload = text;
        if (!payload.includes(':')) return null;
    }
    try {
        let textParts = payload.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = textParts.join(':');
        let decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch(e) {
        return null;
    }
}

// Huella digital de la carpeta: los primeros 8 caracteres del HMAC del UUID
// → la carpeta tiene nombre único que ningún otro programa puede adivinar
const PH_FOLDER_FINGERPRINT = crypto.createHmac('sha256', PH_APP_UUID).update('folder').digest('hex').substring(0, 8);
const PH_DATA_FOLDER = `PH_GymData_${PH_FOLDER_FINGERPRINT}`;

function getStaticRoot() {
    const candidates = [
        __dirname,
        process.resourcesPath,
        path.join(process.resourcesPath || '', 'app'),
        app.getAppPath(),
        path.dirname(app.getPath('exe')),
        path.join(path.dirname(app.getPath('exe')), 'resources', 'app')
    ].filter(Boolean);

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, 'login-software.html'))) {
            return candidate;
        }
    }

    return __dirname;
}

function sendHtmlFromStaticRoot(res, fileName, staticRoot) {
    const safeFileName = path.basename(fileName);
    const candidates = [
        path.join(staticRoot, safeFileName),
        path.join(__dirname, safeFileName),
        path.join(process.resourcesPath || '', 'app', safeFileName),
        path.join(app.getAppPath(), safeFileName),
        path.join(path.dirname(app.getPath('exe')), 'resources', 'app', safeFileName)
    ];

    const filePath = candidates.find(candidate => fs.existsSync(candidate));
    if (!filePath) {
        return res.status(404).send(`No se encontró ${safeFileName}`);
    }

    res.sendFile(filePath);
}

// Configuración explícita de la carpeta de datos del programa
app.setPath('userData', path.join(app.getPath('appData'), PH_DATA_FOLDER));

function getMachineFingerprint() {
    const base = [
        os.hostname(),
        os.platform(),
        os.arch(),
        os.cpus()?.[0]?.model || '',
        os.totalmem(),
        PH_APP_UUID
    ].join('|');

    return crypto.createHash('sha256').update(base).digest('hex');
}

function getBasicMachineInfo() {
    const cpus = os.cpus() || [];
    const nets = os.networkInterfaces() || {};
    const macs = Object.values(nets)
        .flat()
        .filter(Boolean)
        .filter(n => !n.internal && n.mac && n.mac !== '00:00:00:00:00:00')
        .map(n => n.mac);

    return {
        machineId: getMachineFingerprint(),
        computerId: getMachineFingerprint(),
        idComputadora: getMachineFingerprint(),
        hostname: os.hostname(),
        computerName: os.hostname(),
        user: os.userInfo().username || '',
        username: os.userInfo().username || '',
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        type: os.type(),
        cpuModel: cpus[0]?.model || 'Desconocido',
        cpuCores: cpus.length,
        totalMemoryGb: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 100) / 100,
        appVersion: app.getVersion(),
        installedAt: new Date().toISOString(),
        macHash: crypto.createHash('sha256').update(macs.join('|') || os.hostname()).digest('hex'),
        usernameHash: crypto.createHash('sha256').update(os.userInfo().username || '').digest('hex')
    };
}


let mainWindow;
let terminalWindow = null;
let carnetWindow = null;

function getAvailablePort(startPort = 3000) {
    return new Promise((resolve) => {
        const tryPort = (port) => {
            const tester = net.createServer();
            tester.once('error', () => tryPort(port + 1));
            tester.once('listening', () => {
                tester.close(() => resolve(port));
            });
            tester.listen(port, '127.0.0.1');
        };
        tryPort(startPort);
    });
}

async function createWindow() {
    // Determine where to store/read the database
    const userDataPath = app.getPath('userData');
    const DB_FILE = path.join(userDataPath, 'db.phdata');
    const CLASSES_FILE = path.join(userDataPath, 'classes.phdata');
    const LICENSE_SESSION_FILE = path.join(userDataPath, 'license-session.phdata');
    const TERMINAL_WINDOW_STATE_FILE = path.join(userDataPath, 'terminal-window-state.json');

    function migrateToEncrypted(oldPath, newPath, defaultContent) {
        if (!fs.existsSync(newPath)) {
            if (fs.existsSync(oldPath)) {
                try {
                    const raw = fs.readFileSync(oldPath, 'utf8');
                    fs.writeFileSync(newPath, encrypt(raw));
                    console.log(`Migrated ${oldPath} to ${newPath}`);
                } catch(e) {}
            } else if (defaultContent !== null) {
                fs.writeFileSync(newPath, encrypt(defaultContent));
            }
        }
    }

    // Direct copy of pre-encrypted files if they exist in installer
    try {
        if (!fs.existsSync(DB_FILE) && fs.existsSync(path.join(__dirname, 'db.phdata'))) {
            fs.copyFileSync(path.join(__dirname, 'db.phdata'), DB_FILE);
        }
        if (!fs.existsSync(CLASSES_FILE) && fs.existsSync(path.join(__dirname, 'classes.phdata'))) {
            fs.copyFileSync(path.join(__dirname, 'classes.phdata'), CLASSES_FILE);
        }
    } catch(e) {}

    // Migrate from unpacked db.json/classes.json if exists
    migrateToEncrypted(path.join(__dirname, 'db.json'), DB_FILE, null);
    migrateToEncrypted(path.join(__dirname, 'classes.json'), CLASSES_FILE, null);

    // Migrate from old user data db.json/classes.json if exists
    migrateToEncrypted(path.join(userDataPath, 'db.json'), DB_FILE, null);
    migrateToEncrypted(path.join(userDataPath, 'classes.json'), CLASSES_FILE, null);

    // ── Migración de la carpeta legada 'PowerHausGymData' → nueva carpeta con ADN ────────────
    // Esto garantiza que los datos del usuario no se pierdan al actualizar a la versión con ADN.
    // Los archivos antiguos se re-encriptan con la nueva clave + firma magic header.
    try {
        const LEGACY_FOLDER = path.join(app.getPath('appData'), 'PowerHausGymData');
        const LEGACY_DB     = path.join(LEGACY_FOLDER, 'db.phdata');
        const LEGACY_CLS    = path.join(LEGACY_FOLDER, 'classes.phdata');

        function migrateFromLegacy(legacyPath, targetPath) {
            if (fs.existsSync(legacyPath) && !fs.existsSync(targetPath)) {
                try {
                    const oldRaw = fs.readFileSync(legacyPath, 'utf8');
                    // Intentar descifrar con clave vieja (SHA-256 sin UUID salt)
                    const OLD_KEY = crypto.createHash('sha256').update('PowerHaus_Secure_AntiHack_2026').digest();
                    let oldPayload = null;
                    if (oldRaw.includes('|')) {
                        // Already has magic, use new key (already migrated format)
                        oldPayload = oldRaw.substring(oldRaw.indexOf('|') + 1);
                    } else {
                        oldPayload = oldRaw;
                    }
                    const parts = oldPayload.split(':');
                    if (parts.length >= 2) {
                        const iv  = Buffer.from(parts.shift(), 'hex');
                        const enc = parts.join(':');
                        let dec = null;
                        try {
                            const dOld = crypto.createDecipheriv('aes-256-cbc', OLD_KEY, iv);
                            dec = dOld.update(enc, 'hex', 'utf8') + dOld.final('utf8');
                        } catch(e2) { dec = null; }
                        if (dec) {
                            // Re-encrypt with new DNA key + magic header
                            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                            fs.writeFileSync(targetPath, encrypt(dec));
                            console.log(`[ADN] Migrated legacy ${legacyPath} → ${targetPath}`);
                        }
                    }
                } catch(e) { console.warn('[ADN] Legacy migration failed:', e.message); }
            }
        }

        migrateFromLegacy(LEGACY_DB,  DB_FILE);
        migrateFromLegacy(LEGACY_CLS, CLASSES_FILE);
    } catch(e) { console.warn('[ADN] Legacy folder migration error:', e.message); }
    // ─────────────────────────────────────────────────────────────────────────────────────────

    function readTerminalWindowState() {
        try {
            if (!fs.existsSync(TERMINAL_WINDOW_STATE_FILE)) return null;
            const raw = fs.readFileSync(TERMINAL_WINDOW_STATE_FILE, 'utf8');
            const state = JSON.parse(raw);
            if (typeof state !== 'object' || state === null) return null;
            if (typeof state.width !== 'number' || typeof state.height !== 'number') return null;
            return state;
        } catch (e) {
            return null;
        }
    }

    function writeTerminalWindowState(win) {
        try {
            if (!win || win.isDestroyed()) return;
            const bounds = win.getBounds();
            fs.writeFileSync(TERMINAL_WINDOW_STATE_FILE, JSON.stringify(bounds, null, 2));
        } catch (e) {}
    }

    function openOrFocusTerminalWindow(url) {
        if (terminalWindow && !terminalWindow.isDestroyed()) {
            if (terminalWindow.isMinimized()) terminalWindow.restore();
            terminalWindow.focus();
            return;
        }

        const saved = readTerminalWindowState();

        terminalWindow = new BrowserWindow({
            width: saved?.width || 1280,
            height: saved?.height || 800,
            x: typeof saved?.x === 'number' ? saved.x : undefined,
            y: typeof saved?.y === 'number' ? saved.y : undefined,
            minWidth: 1000,
            minHeight: 700,
            autoHideMenuBar: true,
            frame: true,
            movable: true,
            resizable: true,
            title: 'GYM-TECH Control Terminal',
            webPreferences: {
                nodeIntegration: false
            }
        });

        terminalWindow.loadURL(url);

        terminalWindow.on('resize', () => writeTerminalWindowState(terminalWindow));
        terminalWindow.on('move', () => writeTerminalWindowState(terminalWindow));
        terminalWindow.on('close', () => writeTerminalWindowState(terminalWindow));
        terminalWindow.on('closed', () => {
            terminalWindow = null;
        });
    }

    function openOrFocusCarnetWindow(url) {
        if (carnetWindow && !carnetWindow.isDestroyed()) {
            carnetWindow.loadURL(url);
            if (carnetWindow.isMinimized()) carnetWindow.restore();
            carnetWindow.focus();
            return;
        }

        const displays = screen.getAllDisplays();
        const targetDisplay = displays.length > 1 ? displays[1] : screen.getPrimaryDisplay();
        const wa = targetDisplay.workArea;

        const width = Math.min(1100, wa.width);
        const height = Math.min(760, wa.height);
        const x = Math.round(wa.x + (wa.width - width) / 2);
        const y = Math.round(wa.y + (wa.height - height) / 2);

        carnetWindow = new BrowserWindow({
            width,
            height,
            x,
            y,
            minWidth: 900,
            minHeight: 650,
            autoHideMenuBar: true,
            frame: true,
            movable: true,
            resizable: true,
            title: 'Carnet de Miembro',
            webPreferences: {
                nodeIntegration: false
            }
        });

        carnetWindow.loadURL(url);

        carnetWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });

        carnetWindow.on('closed', () => {
            carnetWindow = null;
        });
    }

    // ---------------------------------------------
    // START EXPRESS SERVER FROM server.cjs LOGIC
    // ---------------------------------------------
    const serverApp = express();
    const PORT = await getAvailablePort(3000);
    const STATIC_ROOT = getStaticRoot();
    
    serverApp.use(cors());
    serverApp.use(express.json({ limit: '50mb' }));
    serverApp.use(express.static(STATIC_ROOT));

    serverApp.get('/login-software.html', (req, res) => {
        sendHtmlFromStaticRoot(res, 'login-software.html', STATIC_ROOT);
    });

    serverApp.get('/:page.html', (req, res) => {
        sendHtmlFromStaticRoot(res, req.params.page + '.html', STATIC_ROOT);
    });

    const DEFAULT_ADMIN = {
        name: 'admin',
        email: 'admin@powerhaus.com',
        pass: 'admin123',
        role: 'Admin',
        photo: '',
        perms: ['Gestionar Miembros', 'Editar Horarios', 'Registros Financieros', 'Reserva de Clases'],
        initials: 'AD'
    };

    function readDB() {
        try {
            if (!fs.existsSync(DB_FILE)) {
                fs.writeFileSync(DB_FILE, encrypt(JSON.stringify([DEFAULT_ADMIN], null, 2)));
            }
            let raw = fs.readFileSync(DB_FILE, 'utf8');
            let dec = decrypt(raw);
            return dec ? JSON.parse(dec) : [{ ...DEFAULT_ADMIN }];
        } catch(err) {
            return [{ ...DEFAULT_ADMIN }];
        }
    }

    function writeDB(data) {
        // Siempre proteger al admin
        const adminIdx = data.findIndex(u => u.role === 'Admin');
        if (adminIdx === -1) {
            data.unshift({ ...DEFAULT_ADMIN });
        } else {
            if (!data[adminIdx].pass) data[adminIdx].pass = DEFAULT_ADMIN.pass;
            if (!data[adminIdx].name) data[adminIdx].name = DEFAULT_ADMIN.name;
        }
        fs.writeFileSync(DB_FILE, encrypt(JSON.stringify(data, null, 2)));
    }

    function readClasses() {
        try {
            if (!fs.existsSync(CLASSES_FILE)) {
                fs.writeFileSync(CLASSES_FILE, encrypt('[]'));
            }
            let raw = fs.readFileSync(CLASSES_FILE, 'utf8');
            let dec = decrypt(raw);
            return dec ? JSON.parse(dec) : [];
        } catch(err) {
            return [];
        }
    }

    function writeClasses(data) {
        fs.writeFileSync(CLASSES_FILE, encrypt(JSON.stringify(data, null, 2)));
    }

    function readLicenseSession() {
        try {
            if (!fs.existsSync(LICENSE_SESSION_FILE)) return null;
            const raw = fs.readFileSync(LICENSE_SESSION_FILE, 'utf8');
            const dec = decrypt(raw);
            return dec ? JSON.parse(dec) : null;
        } catch (e) {
            return null;
        }
    }

    function writeLicenseSession(data) {
        fs.writeFileSync(LICENSE_SESSION_FILE, encrypt(JSON.stringify(data, null, 2)));
    }

    function clearLicenseSession() {
        try {
            if (fs.existsSync(LICENSE_SESSION_FILE)) fs.unlinkSync(LICENSE_SESSION_FILE);
        } catch (e) {}
    }

    async function validateSavedLicenseSession() {
        const session = readLicenseSession();
        if (!session?.licenseKey) return null;

        const result = await validateLicenseInNeon(session.licenseKey, session.email || '');
        if (!result.ok) {
            clearLicenseSession();
            return null;
        }

        const machineInfo = getBasicMachineInfo();
        await registerInstalledProgramInNeon(result, machineInfo);
        writeLicenseSession({
            licenseKey: result.licenseKey,
            userId: result.userId,
            email: result.email || session.email || '',
            lastValidatedAt: new Date().toISOString()
        });

        return {
            ok: true,
            licenseKey: result.licenseKey,
            userId: result.userId,
            email: result.email || session.email || '',
            machineInfo
        };
    }

    let isDormant = false;

    // Middleware interceptor para el estado inactivo (simula apagado)
    serverApp.use('/api', (req, res, next) => {
        if (req.path === '/startup' || req.path === '/shutdown') {
            return next();
        }
        if (isDormant) {
            return res.status(503).json({ error: 'Base de datos apagada intencionalmente.' });
        }
        next();
    });

    serverApp.get('/api/users', (req, res) => res.json(readDB()));

    serverApp.get('/api/machine-info', (req, res) => {
        try {
            res.json(getBasicMachineInfo());
        } catch (e) {
            res.status(500).json({ error: 'No se pudieron leer las características del equipo.' });
        }
    });

    serverApp.post('/api/license/validate', async (req, res) => {
        try {
            const licenseKey = normalizeLicenseKey(req.body?.licenseKey);
            const email = String(req.body?.email || '').trim();
            if (!licenseKey) {
                return res.status(400).json({ ok: false, message: 'Debes ingresar una clave de licencia.' });
            }

            const result = await validateLicenseInNeon(licenseKey, email);
            if (!result.ok) {
                return res.status(403).json(result);
            }

            const machineInfo = getBasicMachineInfo();
            await registerInstalledProgramInNeon(result, machineInfo);
            writeLicenseSession({
                licenseKey: result.licenseKey,
                userId: result.userId,
                email: result.email || email,
                lastValidatedAt: new Date().toISOString()
            });
            res.json({
                ok: true,
                licenseKey: result.licenseKey,
                userId: result.userId,
                email: result.email || email,
                machineInfo
            });
        } catch (e) {
            console.error('Neon license validation error:', e);
            res.status(500).json({ ok: false, message: 'No se pudo conectar con Neon para validar la licencia.' });
        }
    });

    serverApp.get('/api/license/session', async (req, res) => {
        try {
            const sessionResult = await validateSavedLicenseSession();
            if (!sessionResult) {
                return res.json({ ok: false, message: 'No hay licencia guardada.' });
            }
            res.json(sessionResult);
        } catch (e) {
            console.error('Neon license session error:', e);
            res.status(500).json({ ok: false, message: 'No se pudo revalidar la licencia guardada.' });
        }
    });

    serverApp.post('/api/license/uninstall', async (req, res) => {
        try {
            const licenseKey = normalizeLicenseKey(req.body?.licenseKey);
            if (!licenseKey) {
                return res.status(400).json({ ok: false, message: 'Debes ingresar una clave de licencia.' });
            }

            const row = await findLicenseInNeon(licenseKey);
            if (!row) {
                return res.status(404).json({ ok: false, message: 'Clave de licencia no encontrada en Neon.' });
            }

            clearLicenseSession();
            res.json({ ok: true, message: 'Licencia desvinculada localmente.' });
        } catch (e) {
            console.error('Neon license uninstall error:', e);
            res.status(500).json({ ok: false, message: 'No se pudo conectar con Neon para desinstalar la licencia.' });
        }
    });

    
    
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

    serverApp.get('/api/backup/save-dialog', async (req, res) => {
        try {
            const mode = req.query.mode || 'local';
            const dateStr = new Date().toISOString().split('T')[0];
            const defaultFilename = `powerhaus_secure_backup_${dateStr}.phbak`;
            
            let defaultPath = defaultFilename;
            if (mode === 'drive') {
                // Attempt to find Google Drive
                const possiblePaths = [
                    'G:\\Mi unidad',
                    'G:\\My Drive',
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
                    'G:\\Mi unidad',
                    'G:\\My Drive',
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

    serverApp.get('/api/backup/download', (req, res) => {
        try {
            const payload = JSON.stringify({
                timestamp: new Date().toISOString(),
                users: readDB(),
                classes: readClasses()
            });
            res.setHeader('Content-disposition', 'attachment; filename=powerhaus_secure_backup.phbak');
            res.setHeader('Content-type', 'application/octet-stream');
            res.send(encrypt(payload));
        } catch(e) {
            res.status(500).send('Error');
        }
    });

    serverApp.post('/api/backup/restore', (req, res) => {
        try {
            const encryptedPayload = req.body.payload;
            if (!encryptedPayload) throw new Error('No payload');
            const decrypted = decrypt(encryptedPayload);
            if (!decrypted) throw new Error('Invalid encryption or corrupted file');
            const data = JSON.parse(decrypted);
            if (data.users) writeDB(data.users);
            if (data.classes) writeClasses(data.classes);
            res.json({ success: true });
        } catch(e) {
            res.status(500).json({ error: 'Error al restaurar: archivo inválido o corrupto.' });
        }
    });

    serverApp.post('/api/users', (req, res) => {
        const db = readDB();
        let newUser = req.body;
        if (!newUser.checkIns) newUser.checkIns = [];
        if (!newUser.checkOuts) newUser.checkOuts = [];
        if (!newUser.payments) newUser.payments = [];
        db.push(newUser);
        writeDB(db);
        res.json({ success: true });
    });

    serverApp.put('/api/users/:identifier', (req, res) => {
        const db = readDB();
        const identifier = String(req.params.identifier || '').trim();

        let index = db.findIndex(u => String(u.id || '').trim() === identifier);

        if (index === -1) {
            index = db.findIndex(u => String(u.email || '').trim() === identifier);
        }

        if (index === -1) {
            index = db.findIndex(u => String(u.name || '').trim().toLowerCase() === identifier.toLowerCase());
        }

        if(index !== -1) {
            db[index] = { ...db[index], ...req.body };
            writeDB(db);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    });

    serverApp.post('/api/users/:identifier/attendance/delete', (req, res) => {
        const db = readDB();
        const identifier = String(req.params.identifier || '').trim();

        const normalize = (v) => String(v || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        let index = db.findIndex(u => String(u.id || '').trim() === identifier);
        if (index === -1) index = db.findIndex(u => String(u.email || '').trim() === identifier);
        if (index === -1) index = db.findIndex(u => normalize(u.name) === normalize(identifier));

        if (index === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { inRaw, outRaw, fecha, entrada, salida } = req.body || {};

        const user = { ...db[index] };
        let checkIns = Array.isArray(user.checkIns) ? [...user.checkIns] : [];
        let checkOuts = Array.isArray(user.checkOuts) ? [...user.checkOuts] : [];

        let removedIn = false;
        let removedOut = false;

        if (inRaw) {
            const before = checkIns.length;
            checkIns = checkIns.filter(x => x !== inRaw);
            removedIn = checkIns.length < before;
        }

        const outRef = outRaw || inRaw;
        if (outRef) {
            const before = checkOuts.length;
            checkOuts = checkOuts.filter(x => x !== outRef);
            removedOut = checkOuts.length < before;
        }

        const toIsoMinute = (f, hhmm) => {
            if (!f || !hhmm || hhmm === '--:--') return null;
            const [h, m] = String(hhmm).split(':');
            if (h === undefined || m === undefined) return null;
            return `${f}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        const sameMinute = (iso, targetPrefix) => {
            if (!iso || !targetPrefix) return false;
            const d = new Date(iso);
            if (isNaN(d.getTime())) return false;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            const localPrefix = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
            return localPrefix === targetPrefix;
        };

        const inTarget = toIsoMinute(fecha, entrada);
        const outTarget = toIsoMinute(fecha, salida);

        if (!removedIn && inTarget) {
            const before = checkIns.length;
            let removedOnce = false;
            checkIns = checkIns.filter(x => {
                if (!removedOnce && sameMinute(x, inTarget)) {
                    removedOnce = true;
                    return false;
                }
                return true;
            });
            removedIn = checkIns.length < before;
        }

        if (!removedOut && outTarget) {
            const before = checkOuts.length;
            let removedOnce = false;
            checkOuts = checkOuts.filter(x => {
                if (!removedOnce && sameMinute(x, outTarget)) {
                    removedOnce = true;
                    return false;
                }
                return true;
            });
            removedOut = checkOuts.length < before;
        }

        if (!removedIn && !removedOut) {
            return res.status(404).json({ error: 'No se encontró el registro de asistencia a eliminar' });
        }

        user.checkIns = checkIns;
        user.checkOuts = checkOuts;
        user.lastCheckIn = checkIns.length ? checkIns[checkIns.length - 1] : null;
        user.lastCheckOut = checkOuts.length ? checkOuts[checkOuts.length - 1] : null;

        db[index] = user;
        writeDB(db);

        res.json({ success: true, removedIn, removedOut });
    });

    serverApp.delete('/api/users/:id', (req, res) => {
        let db = readDB();
        const target = String(req.params.id).trim();

        // Find user before deleting
        const userToDelete = db.find(u => {
            const currentId = String(u.id || '').trim();
            const currentEmail = String(u.email || '').trim();
            return currentId === target || currentEmail === target;
        });

        // Protect last admin
        if (userToDelete && (userToDelete.role || '') === 'Admin') {
            const adminCount = db.filter(u => u.role === 'Admin').length;
            if (adminCount <= 1) {
                return res.status(403).json({ error: 'No se puede eliminar el unico administrador.' });
            }
        }

        const isTrainer = userToDelete && (
            (userToDelete.role || '').toLowerCase().includes('entrenador') ||
            (userToDelete.role || '').toLowerCase() === 'trainer' ||
            (userToDelete.role || '').toLowerCase() === 'staff'
        );

        // Remove user from DB
        db = db.filter(u => {
            const currentId = String(u.id || '').trim();
            const currentEmail = String(u.email || '').trim();
            if (currentId === target) return false;
            if (currentEmail === target) return false;
            return true;
        });

        // If deleting a TRAINER: clear entrenadorAsignado from their members
        if (isTrainer && userToDelete && userToDelete.name) {
            db = db.map(u => {
                if (u.entrenadorAsignado === userToDelete.name) {
                    const updated = { ...u };
                    delete updated.entrenadorAsignado;
                    return updated;
                }
                return u;
            });
        }

        writeDB(db);

        // Cascade: clean classes
        if (userToDelete && userToDelete.name) {
            let classes = readClasses();
            let changed = false;

            classes = classes.filter(c => {
                let classChanged = false;

                // Remove member from inscriptions
                if (c.inscritos && c.inscritos.includes(userToDelete.name)) {
                    c.inscritos = c.inscritos.filter(n => n !== userToDelete.name);
                    classChanged = true;
                }

                // Remove member from attendance records
                if (c.asistencia && c.asistencia[userToDelete.name] !== undefined) {
                    delete c.asistencia[userToDelete.name];
                    classChanged = true;
                }

                // Only reassign trainer if deleted user was the trainer
                if (isTrainer && c.entrenador === userToDelete.name) {
                    c.entrenador = 'Sin Asignar';
                    classChanged = true;
                }

                if (classChanged) {
                    changed = true;
                }

                // If class now has 0 inscritos → remove it from calendar entirely
                const inscritosLeft = (c.inscritos || []).length;
                if (inscritosLeft === 0 && classChanged) {
                    changed = true;
                    return false; // delete this class
                }

                return true;
            });

            if (changed) writeClasses(classes);
        }

        res.json({ success: true });
    });

    serverApp.get('/api/classes', (req, res) => res.json(readClasses()));

    serverApp.post('/api/classes', (req, res) => {
        const classes = readClasses();
        classes.push(req.body);
        writeClasses(classes);
        res.json({ success: true });
    });

    serverApp.put('/api/classes/:id', (req, res) => {
        let classes = readClasses();
        const idToUpdate = req.params.id;
        const index = classes.findIndex(c => String(c.id) === String(idToUpdate));
        if (index !== -1) {
            classes[index] = { ...classes[index], ...req.body };
            writeClasses(classes);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Clase no encontrada" });
        }
    });

    serverApp.delete('/api/classes/:id', (req, res) => {
        let classes = readClasses();
        const target = String(req.params.id).trim();
        classes = classes.filter(c => String(c.id || '').trim() !== target);
        writeClasses(classes);
        res.json({ success: true });
    });

    // Shutdown (Soft Shutdown - Dormant State)
    serverApp.post('/api/shutdown', (req, res) => {
        isDormant = false; // forced always on
        res.json({ success: true, message: 'Base de datos apagada (esquema latente).' });
        console.log('Comando de apagado recibido en Electron. DB inactiva.');
    });

    // Startup (Wake up Database)
    serverApp.post('/api/startup', (req, res) => {
        isDormant = false;
        res.json({ success: true, message: 'Base de datos encendida.' });
        console.log('Comando de encendido recibido en Electron. DB activa.');
    });

    serverApp.listen(PORT, '127.0.0.1', async () => {
        console.log(`Server embedded running on port ${PORT}`);

        // Setup Window
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            autoHideMenuBar: true,
            title: "PowerHaus",
            webPreferences: {
                nodeIntegration: false,
                preload: undefined
            }
        });

        let startupUrl = `http://127.0.0.1:${PORT}/login-software.html?v=${Date.now()}`;
        try {
            const sessionResult = await validateSavedLicenseSession();
            if (sessionResult?.ok) {
                startupUrl = `http://127.0.0.1:${PORT}/index.html?v=${Date.now()}`;
            }
        } catch (e) {
            console.warn('No se pudo iniciar automáticamente con licencia guardada:', e.message);
        }

        mainWindow.loadURL(startupUrl);
        mainWindow.maximize();

        // Vigía para interceptar sesión revocada desde la base de datos remotamente
        setInterval(async () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                const currentURL = mainWindow.webContents.getURL();
                if (!currentURL.includes('login-software.html')) {
                    try {
                        const session = readLicenseSession();
                        if (session && session.licenseKey) {
                            const result = await validateLicenseInNeon(session.licenseKey, session.email || '');
                            if (!result.ok) {
                                clearLicenseSession();
                                mainWindow.loadURL(`http://127.0.0.1:${PORT}/login-software.html?v=${Date.now()}`);
                            }
                        }
                    } catch (e) {
                        // ignore network errors
                    }
                }
            }
        }, 15000);

        // Vigía para interceptar el login exitoso (reemplaza el C#)
        mainWindow.webContents.on('will-navigate', (event, url) => {
            if (url.startsWith('compugames://login-success')) {
                event.preventDefault();
                // Una vez logueado, vamos al panel principal
                mainWindow.loadURL(`http://127.0.0.1:${PORT}/index.html?v=${Date.now()}`);
            }
        });

        mainWindow.on('closed', function () {
            mainWindow = null;
            // Apagar la app completa al cerrar la ventana
            app.quit();
        });

        // Intercept target="_blank": open terminal_asistencia in its own movable Electron window.
        // Any other external link opens in default browser.
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (url.includes('terminal_asistencia.html')) {
                openOrFocusTerminalWindow(url);
                return { action: 'deny' };
            }

            if (url.includes('carnet_miembro.html')) {
                openOrFocusCarnetWindow(url);
                return { action: 'deny' };
            }

            shell.openExternal(url);
            return { action: 'deny' };
        });
    }).on('error', (e) => {
        console.error('Server error:', e);
    });
}

app.on('ready', createWindow);

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


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
