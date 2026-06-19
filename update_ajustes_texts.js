const fs = require('fs');
let html = fs.readFileSync('ajustes.html', 'utf8');

html = html.replace('Busca automáticamente tu unidad de Drive', 'Inicia sesión con tu cuenta de Gmail de forma segura');
html = html.replace('Buscar en tu unidad de Drive vinculada', 'Descargar de tu cuenta de Google Drive asociada');

fs.writeFileSync('ajustes.html', html);
console.log('UI texts updated');
