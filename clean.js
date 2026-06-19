const fs = require('fs');
try {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Carpeta dist limpiada exitosamente.');
} catch (err) {
    console.error('No se pudo borrar dist por completo (posible archivo en uso), ignorando...');
}
