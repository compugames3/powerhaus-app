const { app, BrowserWindow, shell, screen } = require('electron');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Configuración explícita de la carpeta de datos del programa (equivalente a UserDataFolder)
app.setPath('userData', path.join(app.getPath('appData'), 'PowerHausGymData'));


let mainWindow;
let terminalWindow = null;
let carnetWindow = null;

function createWindow() {
    // Determine where to store/read the database
    const userDataPath = app.getPath('userData');
    const DB_FILE = path.join(userDataPath, 'db.json');
    const CLASSES_FILE = path.join(userDataPath, 'classes.json');
    const TERMINAL_WINDOW_STATE_FILE = path.join(userDataPath, 'terminal-window-state.json');

    // Migrate existing db.json if running the first time and it exists in the install dir
    try {
        const sourceDb = path.join(__dirname, 'db.json');
        if (!fs.existsSync(DB_FILE)) {
            if (fs.existsSync(sourceDb)) {
                fs.copyFileSync(sourceDb, DB_FILE);
                console.log("Copied local db.json to UserData dir.");
            } else {
                // Let the readDB logic create it
            }
        }
    } catch(e) {}

    // Migrate classes.json if it doesn't yet exist in userData
    try {
        const sourceClasses = path.join(__dirname, 'classes.json');
        if (!fs.existsSync(CLASSES_FILE)) {
            if (fs.existsSync(sourceClasses)) {
                fs.copyFileSync(sourceClasses, CLASSES_FILE);
            } else {
                fs.writeFileSync(CLASSES_FILE, '[]');
            }
            console.log("Initialized classes.json in UserData dir.");
        }
    } catch(e) {}

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
    const PORT = 3000;
    
    serverApp.use(cors());
    serverApp.use(express.json({ limit: '50mb' }));
    serverApp.use(express.static(__dirname));

    const DEFAULT_ADMIN = {
        name: 'admin',
        email: 'admin@powerhaus.com',
        pass: 'admin123',
        role: 'Admin',
        photo: '',
        perms: ['Gestionar Miembros', 'Editar Horarios', 'Registros Financieros', 'Reserva de Clases'],
        initials: 'AD'
    };

    function safeReadFile(filePath) {
        if (!fs.existsSync(filePath)) return null;
        let buf = fs.readFileSync(filePath);
        if (buf[0] === 0xff && buf[1] === 0xfe) return buf.toString('utf16le');
        if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.toString('utf8').substring(1);
        if (buf[0] === 0xfe && buf[1] === 0xff) return buf.toString('utf16be');
        return buf.toString('utf8');
    }

    function readDB() {
        try {
            if (!fs.existsSync(DB_FILE)) {
                fs.writeFileSync(DB_FILE, JSON.stringify([DEFAULT_ADMIN], null, 2));
            }
            return JSON.parse(safeReadFile(DB_FILE));
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
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }

    function readClasses() {
        try {
            if (!fs.existsSync(CLASSES_FILE)) {
                fs.writeFileSync(CLASSES_FILE, '[]');
            }
            return JSON.parse(safeReadFile(CLASSES_FILE));
        } catch(err) {
            return [];
        }
    }

    function writeClasses(data) {
        fs.writeFileSync(CLASSES_FILE, JSON.stringify(data, null, 2));
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

    serverApp.post('/api/users', (req, res) => {
        const db = readDB();
        db.push(req.body);
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

    serverApp.listen(PORT, '127.0.0.1', () => {
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

        mainWindow.loadURL(`http://localhost:${PORT}/login_licencia.html`);
        mainWindow.maximize();

        // Vigía para interceptar el login exitoso (reemplaza el C#)
        mainWindow.webContents.on('will-navigate', (event, url) => {
            if (url.startsWith('compugames://login-success')) {
                event.preventDefault();
                // Una vez logueado, vamos al panel principal
                mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
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
        // If port 3000 is busy, maybe another instance is running? 
        // We could just launch the window and point it there
        if (e.code === 'EADDRINUSE') {
            console.log("Port busy! Starting window anyway...");
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

            mainWindow.loadURL(`http://localhost:${PORT}/login_licencia.html`);
            mainWindow.maximize();

            // Vigía para interceptar el login exitoso (reemplaza el C#)
            mainWindow.webContents.on('will-navigate', (event, url) => {
                if (url.startsWith('compugames://login-success')) {
                    event.preventDefault();
                    // Una vez logueado, vamos al panel principal
                    mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
                }
            });

            mainWindow.on('closed', function () {
                mainWindow = null;
                app.quit();
            });

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
        } else {
            console.error('Server error:', e);
        }
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
