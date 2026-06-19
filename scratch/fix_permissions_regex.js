const fs = require('fs');
const files = ['crear_usuario.html', 'editar_usuario.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const targetRegex = /\/\/ Auto-assign permissions based on role[\s\S]*?if \(!window\.isAutoFilling\) \{[\s\S]*?const permsCheckboxes = document\.querySelectorAll\('\.perm-option'\);[\s\S]*?let desiredPerms = \[\];[\s\S]*?if \(role === 'Admin'\) \{[\s\S]*?desiredPerms = \['Gestionar Miembros', 'Registros Financieros', 'Editar Horarios', 'Reserva de Clases'\];[\s\S]*?\} else if \(role === 'Empleados'\) \{[\s\S]*?desiredPerms = \['Gestionar Miembros', 'Editar Horarios', 'Reserva de Clases'\];[\s\S]*?\}[\s\S]*?permsCheckboxes\.forEach\(el => \{[\s\S]*?let permName = el\.querySelector\('span'\) \? el\.querySelector\('span'\)\.innerText\.trim\(\) : el\.innerText\.trim\(\);[\s\S]*?let isPresent = desiredPerms\.includes\(permName\);[\s\S]*?let isChecked = el\.getAttribute\('data-checked'\) === 'true';[\s\S]*?if \(isPresent && !isChecked\) togglePerm\(el\.id\);[\s\S]*?if \(!isPresent && isChecked\) togglePerm\(el\.id\);[\s\S]*?\}\);[\s\S]*?\}/g;
    
    if (targetRegex.test(content)) {
        content = content.replace(targetRegex, `// Auto-assign permissions based on role (DISABLED)
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
    */`);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Replaced in ${file}`);
    } else {
        console.log(`Target not found in ${file}.`);
    }
}
