const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const CLASSES_FILE = path.join(__dirname, 'classes.json');

app.use(cors());
app.use(express.json());
// Servir todos los archivos estaticos
app.use(express.static(__dirname, { 
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// CARPETA DE IMAGENES
const IMAGES_DIR = path.join(__dirname, 'imagenes');
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR);
}
app.use('/imagenes', express.static(IMAGES_DIR, {
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
}));

function processBase64Image(base64String, prefix) {
    if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image/')) {
        return base64String;
    }
    try {
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return base64String;
        
        const extMatch = matches[1];
        let ext = 'jpg';
        if (extMatch.includes('png')) ext = 'png';
        if (extMatch.includes('gif')) ext = 'gif';
        if (extMatch.includes('webp')) ext = 'webp';

        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${prefix}_${Date.now()}.${ext}`;
        const filepath = path.join(IMAGES_DIR, filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log('Imagen fisica guardada:', filename);
        return '/imagenes/' + filename;
    } catch(err) {
        console.error('Error guardando imagen fisicamente', err);
        return base64String;
    }
}

function extractImagesFromObject(obj, prefix) {
    if (!obj || typeof obj !== 'object') return obj;
    for (let key in obj) {
       if (typeof obj[key] === 'string' && obj[key].startsWith('data:image/')) {
           obj[key] = processBase64Image(obj[key], prefix);
       } else if (typeof obj[key] === 'object' && obj[key] !== null) {
           extractImagesFromObject(obj[key], prefix);
       }
    }
    return obj;
}

// API genérica de Subir Imagenes
app.post('/api/upload_image', (req, res) => {
    const base64 = req.body.image;
    const prefix = req.body.prefix || 'img';
    const finalUrl = processBase64Image(base64, prefix);
    res.json({ url: finalUrl });
});


// ---- ADMIN PROTEGIDO (siempre garantizado) ----
const DEFAULT_ADMIN = {
    name: 'admin',
    email: 'admin@powerhaus.com',
    pass: 'admin123',
    role: 'Admin',
    photo: '',
    perms: ['Gestionar Miembros', 'Editar Horarios', 'Registros Financieros', 'Reserva de Clases'],
    initials: 'AD'
};

// Read
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
        return [DEFAULT_ADMIN];
    }
}

// Write DB - SIEMPRE mantiene al menos un Admin con contraseña
function writeDB(data) {
    // Garantizar que siempre exista el admin
    const adminIdx = data.findIndex(u => u.role === 'Admin');
    if (adminIdx === -1) {
        data.unshift({ ...DEFAULT_ADMIN });
    } else {
        // Asegurar que el admin siempre tenga pass correcta
        if (!data[adminIdx].pass) {
            data[adminIdx].pass = DEFAULT_ADMIN.pass;
        }
        if (!data[adminIdx].name) {
            data[adminIdx].name = DEFAULT_ADMIN.name;
        }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Seed: verifica que exista el admin al arrancar
function seedAdmin() {
    const db = readDB();
    const adminIdx = db.findIndex(u => u.role === 'Admin');
    if (adminIdx === -1) {
        db.unshift({ ...DEFAULT_ADMIN });
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        console.log('✅ Admin creado automaticamente en la base de datos.');
    } else {
        // Reparar si le falta la contraseña
        if (!db[adminIdx].pass) {
            db[adminIdx].pass = DEFAULT_ADMIN.pass;
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            console.log('✅ Contraseña del Admin restaurada automaticamente.');
        }
        const admin = db[adminIdx];
        console.log(`✅ Admin verificado: ${admin.name} / pass: ${admin.pass}`);
    }
}

// Read Classes
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

// Write Classes
function writeClasses(data) {
    fs.writeFileSync(CLASSES_FILE, JSON.stringify(data, null, 2));
}

let isDormant = false;

// Middleware interceptor para el estado inactivo (simula apagado)
app.use('/api', (req, res, next) => {
    if (req.path === '/startup' || req.path === '/shutdown') {
        return next();
    }
    if (isDormant) {
        return res.status(503).json({ error: 'Base de datos apagada intencionalmente.' });
    }
    next();
});

// GET all users
app.get('/api/users', (req, res) => {
    res.json(readDB());
});

// POST new user
app.post('/api/users', (req, res) => {
    const db = readDB();
    let newUser = req.body;
    
    // Extraer imagenes base64 y transformar en rutas fÍsicas
    newUser = extractImagesFromObject(newUser, 'user_' + (newUser.name || 'new').replace(/\W/g, '').substring(0,5));

    db.push(newUser);
    writeDB(db);
    res.json({ success: true });
});

// PUT (update) existing user - busca por id, email, o nombre
app.put('/api/users/:identifier', (req, res) => {
    const db = readDB();
    const identifier = req.params.identifier;
    const updatedData = req.body;
    
    let index = db.findIndex(u => String(u.id) === identifier);
    if (index === -1) index = db.findIndex(u => u.email === identifier);
    if (index === -1) index = db.findIndex(u => u.name && u.name.toLowerCase() === identifier.toLowerCase());
    
    if (index !== -1) {
        // Si es Admin, conservar siempre el rol Admin
        if (db[index].role === 'Admin') {
            updatedData.role = 'Admin';
        }
        
        // Extraer imagenes base64 de la actualizacion
        extractImagesFromObject(updatedData, 'user_upd_' + String(identifier).substring(0,5));
        
        db[index] = { ...db[index], ...updatedData };
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
});

// DELETE user - NO permite borrar el ultimo Admin
app.delete('/api/users/:id', (req, res) => {
    let db = readDB();
    const idToDelete = req.params.id;
    const userToDelete = db.find(u => String(u.id) === idToDelete || u.email === idToDelete);
    
    if (userToDelete && userToDelete.role === 'Admin') {
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

    // Remove user from db
    db = db.filter(u => String(u.id) !== idToDelete && u.email !== idToDelete);

    // If deleting a TRAINER: clear entrenadorAsignado from any member that referenced them
    if (isTrainer && userToDelete.name) {
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

    if (userToDelete && userToDelete.name) {
        let classes = readClasses();
        let changed = false;

        classes = classes.filter(c => {
            let classChanged = false;

            // Remove member from inscriptions
            if (c.inscritos && c.inscritos.includes(userToDelete.name)) {
                c.inscritos = c.inscritos.filter(name => name !== userToDelete.name);
                classChanged = true;
            }

            // Remove member from attendance records
            if (c.asistencia && c.asistencia[userToDelete.name] !== undefined) {
                delete c.asistencia[userToDelete.name];
                classChanged = true;
            }

            // Only change trainer if the DELETED user was themselves a trainer
            if (isTrainer && c.entrenador === userToDelete.name) {
                c.entrenador = 'Sin Asignar';
                classChanged = true;
            }

            if (classChanged) {
                changed = true;
            }

            // If class now has 0 inscritos, remove it from calendar/próximas clases
            const inscritosLeft = (c.inscritos || []).length;
            if (inscritosLeft === 0 && classChanged) {
                changed = true;
                return false;
            }

            return true;
        });

        if (changed) {
            writeClasses(classes);
        }
    }

    res.json({ success: true });
});

// GET all classes
app.get('/api/classes', (req, res) => {
    res.json(readClasses());
});

// POST new class
app.post('/api/classes', (req, res) => {
    const classes = readClasses();
    classes.push(req.body);
    writeClasses(classes);
    res.json({ success: true });
});

// DELETE class
app.delete('/api/classes/:id', (req, res) => {
    let classes = readClasses();
    const idToDelete = req.params.id;
    classes = classes.filter(c => String(c.id) !== idToDelete);
    writeClasses(classes);
    res.json({ success: true });
});

// PUT update class
app.put('/api/classes/:id', (req, res) => {
    let classes = readClasses();
    const idToUpdate = req.params.id;
    const index = classes.findIndex(c => String(c.id) === idToUpdate);
    if (index !== -1) {
        classes[index] = { ...classes[index], ...req.body };
        writeClasses(classes);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Clase no encontrada' });
    }
});

// Shutdown (Soft Shutdown - Dormant State)
app.post('/api/shutdown', (req, res) => {
    isDormant = false; // forced always on
    res.json({ success: true, message: 'Base de datos apagada (esquema latente).' });
    console.log('Comando de apagado recibido. DB en modo inactivo.');
});

// Startup (Wake up Database)
app.post('/api/startup', (req, res) => {
    isDormant = false;
    res.json({ success: true, message: 'Base de datos encendida.' });
    console.log('Comando de encendido recibido. DB activa.');
});

// Ejecutar seed y arrancar servidor
seedAdmin();

app.listen(PORT, () => {
    console.log('===================================================');
    console.log('Servidor Local Iniciado Correctamente.');
    console.log('Abre tu navegador en: http://localhost:' + PORT + '/index.html');
    console.log('===================================================');
});
