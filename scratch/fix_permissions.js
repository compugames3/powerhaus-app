const fs = require('fs');
const files = ['crear_usuario.html', 'editar_usuario.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const target = `    // Auto-assign permissions based on role
    // Only auto-assign if the user clicks it (don't override during auto-fill in edit mode)
    if (!window.isAutoFilling) {
        const permsCheckboxes = document.querySelectorAll('.perm-option');
        
        let desiredPerms = [];
        if (role === 'Admin') {
            desiredPerms = ['Gestionar Miembros', 'Registros Financieros', 'Editar Horarios', 'Reserva de Clases'];
        } else if (role === 'Empleados') {
            desiredPerms = ['Gestionar Miembros', 'Editar Horarios', 'Reserva de Clases'];
        }

        permsCheckboxes.forEach(el => {
            let permName = el.querySelector('span') ? el.querySelector('span').innerText.trim() : el.innerText.trim();
            let isPresent = desiredPerms.includes(permName);
            let isChecked = el.getAttribute('data-checked') === 'true';
            
            if (isPresent && !isChecked) togglePerm(el.id);
            if (!isPresent && isChecked) togglePerm(el.id);
        });
    }`;
    const replacement = `    // Auto-assign permissions based on role
    // Omitted per user request so specific permissions are not erased when switching roles
    /*
    if (!window.isAutoFilling) {
        const permsCheckboxes = document.querySelectorAll('.perm-option');
        
        let desiredPerms = [];
        if (role === 'Admin') {
            desiredPerms = ['Gestionar Miembros', 'Registros Financieros', 'Editar Horarios', 'Reserva de Clases'];
        } else if (role === 'Empleados') {
            desiredPerms = ['Gestionar Miembros', 'Editar Horarios', 'Reserva de Clases'];
        }

        permsCheckboxes.forEach(el => {
            let permName = el.querySelector('span') ? el.querySelector('span').innerText.trim() : el.innerText.trim();
            let isPresent = desiredPerms.includes(permName);
            let isChecked = el.getAttribute('data-checked') === 'true';
            
            if (isPresent && !isChecked) togglePerm(el.id);
            if (!isPresent && isChecked) togglePerm(el.id);
        });
    }
    */`;
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Replaced in ${file}`);
    } else {
        console.log(`Target not found in ${file}.`);
    }
}
