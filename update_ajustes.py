import os

filepath = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\ajustes.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """    systemUsers.forEach(user => {
        let roleColorClass = 'bg-primary/10 text-primary';
        if (user.role === 'Staff' || user.role === 'Empleados') roleColorClass = 'bg-tertiary/10 text-tertiary';
        if (user.role === 'Trainer') roleColorClass = 'bg-surface-container-highest text-on-surface-variant';
        
        let permsHtml = '';"""

replacement = """    const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
    const isEmpleado = sessionData.rol === 'Empleados' || sessionData.role === 'Empleados';
    const btnAddUser = document.querySelector('a[href="crear_usuario.html"]');
    if (btnAddUser && isEmpleado) {
        btnAddUser.style.display = 'none';
    }

    systemUsers.forEach(user => {
        let roleColorClass = 'bg-primary/10 text-primary';
        if (user.role === 'Staff' || user.role === 'Empleados') roleColorClass = 'bg-tertiary/10 text-tertiary';
        if (user.role === 'Trainer') roleColorClass = 'bg-surface-container-highest text-on-surface-variant';
        
        let permsHtml = '';"""

target2 = """            <td class="py-6 px-4 text-right rounded-r-2xl">
                <div class="flex items-center justify-end gap-2">
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors" onclick="editUser('${user.email}')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="edit">edit</span></button>
                    ${user.name === 'admin' || user.role === 'Admin' ? '<button class="p-2 text-slate-400 opacity-30 cursor-not-allowed" title="No puedes eliminar al administrador maestro"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>' : '<button class="p-2 text-slate-400 hover:text-error transition-colors" onclick="deleteUser(\\'' + user.email + '\\')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>'}
                    <button class="p-2 text-slate-400 hover:text-tertiary transition-colors"><span class="material-symbols-outlined notranslate" translate="no" data-icon="lock_open">lock_open</span></button>
                </div>
            </td>"""

replacement2 = """            <td class="py-6 px-4 text-right rounded-r-2xl">
                <div class="flex items-center justify-end gap-2">
                    ${!isEmpleado ? `
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors" onclick="editUser('${user.email}')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="edit">edit</span></button>
                    ${user.name === 'admin' || user.role === 'Admin' ? '<button class="p-2 text-slate-400 opacity-30 cursor-not-allowed" title="No puedes eliminar al administrador maestro"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>' : '<button class="p-2 text-slate-400 hover:text-error transition-colors" onclick="deleteUser(\\'' + user.email + '\\')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>'}
                    <button class="p-2 text-slate-400 hover:text-tertiary transition-colors"><span class="material-symbols-outlined notranslate" translate="no" data-icon="lock_open">lock_open</span></button>
                    ` : ''}
                </div>
            </td>"""

if target in content and target2 in content:
    content = content.replace(target, replacement)
    content = content.replace(target2, replacement2)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("ajustes.html updated successfully")
else:
    print("Targets not found in ajustes.html")
    if target not in content:
        print("target 1 not found")
    if target2 not in content:
        print("target 2 not found")
