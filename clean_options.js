const fs = require('fs');

['editar_entrenador.html', 'editar_usuario.html', 'nuevo_miembro.html'].forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    content = content.replace(/<option value="\+([0-9]+)">[^<]*<\/option>/g, '<option value="+$1">+$1</option>');
    
    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed options in', f);
    }
});
