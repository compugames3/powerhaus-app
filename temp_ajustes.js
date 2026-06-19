
document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    let db;
    try {
        let req = await fetch('/api/users');
        db = await req.json();
    } catch (e) {
        tbody.innerHTML = '<tr class=""><td colspan="5" class="py-12 text-center border-2 border-dashed border-[#ba1a1a]/30 bg-[#ba1a1a]/5 rounded-2xl"><div class="flex flex-col items-center gap-3"><span class="material-symbols-outlined text-4xl text-[#ba1a1a] notranslate" translate="no" data-icon="cloud_off">cloud_off</span><div><strong class="text-xl text-[#ba1a1a]">Falta de Conexión al Sistema</strong><br/><span class="text-slate-500 font-medium mt-1">El programa Arrancar_PowerHaus.vbs está cerrado. Cierra esta ventana, dale doble clic al archivo y vuelve a entrar.</span></div></div></td></tr>';
        return;
    }

    // --- AUTO MIGRATE OLD LOCALSTORAGE USERS ---
    try {
        let oldLocal = JSON.parse(localStorage.getItem('usersDB') || '[]');
        if (oldLocal && oldLocal.length > 0) {
            for (let oldUser of oldLocal) {
                if (!db.some(u => u.email === oldUser.email)) {
                    await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(oldUser)
                    });
                    db.push(oldUser);
                }
            }
            localStorage.removeItem('usersDB');
        }
    } catch(err) {}
    // -------------------------------------------
    
    if(db.length === 0) {
        tbody.innerHTML = '<tr class=""><td colspan="5" class="py-8 text-center text-slate-400">No hay usuarios registrados aún.</td></tr>';
        return;
    }

    let rows = '';
    // Filtrar para que los 'Miembros' y 'Entrenadores' no se mezclen con los Usuarios reales del sistema (Admin/Staff)
    const systemUsers = db.filter(u => u.role === 'Admin' || u.role === 'Staff' || u.role === 'Empleados');
    
    if(systemUsers.length === 0) {
        tbody.innerHTML = '<tr class=""><td colspan="5" class="py-8 text-center text-slate-400">No hay administradores registrados aún.</td></tr>';
        return;
    }

    const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
    const isEmpleado = sessionData.rol === 'Empleados' || sessionData.role === 'Empleados';
    const btnAddUser = document.querySelector('a[href="crear_usuario.html"]');
    if (btnAddUser && isEmpleado) {
        btnAddUser.style.display = 'none';
    }

    systemUsers.forEach(user => {
        let roleColorClass = 'bg-primary/10 text-primary';
        if (user.role === 'Staff' || user.role === 'Empleados') roleColorClass = 'bg-tertiary/10 text-tertiary';
        if (user.role === 'Trainer') roleColorClass = 'bg-surface-container-highest text-on-surface-variant';
        
        let permsHtml = '';
        if(user.perms && user.perms.length > 0){
            user.perms.forEach(perm => {
                permsHtml += `<span class="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded mr-1">${perm}</span>`;
            });
        } else {
            permsHtml = '<span class="text-xs text-slate-400">Sin permisos adicionales</span>';
        }

        let passText = (user.pass || "123").toString();

        rows += `
        <tr class="group hover:bg-surface-container-low transition-colors rounded-2xl">
            <td class="py-6 px-4 rounded-l-2xl">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">${user.initials}</div>
                    <div>
                        <div class="font-bold text-on-surface">${user.name}</div>
                        <div class="text-xs text-slate-400">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="py-6 px-4">
                <div class="flex items-center gap-2">
                    <span class="text-slate-400 font-bold tracking-widest text-[10px] uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded transition-all">Seguridad</span>
                    <span class="material-symbols-outlined text-slate-300 text-sm cursor-pointer hover:text-primary transition-colors notranslate select-none" translate="no" title="Copiar contraseña" onclick="navigator.clipboard.writeText('${passText}'); showToast('Copiado');">content_copy</span>
                </div>
            </td>
            <td class="py-6 px-4">
                <span class="${roleColorClass} text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">${user.role}</span>
            </td>
            <td class="py-6 px-4">
                <div class="flex flex-wrap gap-1">
                    ${permsHtml}
                </div>
            </td>
            <td class="py-6 px-4 text-right rounded-r-2xl">
                <div class="flex items-center justify-end gap-2">
                    ${!isEmpleado ? `
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors" onclick="editUser('${user.email}')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="edit">edit</span></button>
                    ${user.name === 'admin' || user.role === 'Admin' ? '<button class="p-2 text-slate-400 opacity-30 cursor-not-allowed" title="No puedes eliminar al administrador maestro"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>' : '<button class="p-2 text-slate-400 hover:text-error transition-colors" onclick="deleteUser(\'' + user.email + '\')"><span class="material-symbols-outlined notranslate" translate="no" data-icon="delete">delete</span></button>'}
                    <button class="p-2 text-slate-400 hover:text-tertiary transition-colors"><span class="material-symbols-outlined notranslate" translate="no" data-icon="lock_open">lock_open</span></button>
                    ` : ''}
                </div>
            </td>
        </tr>
        <tr class="h-4"></tr>`;
    });

    tbody.innerHTML = rows;
});

let emailToDelete = null;

function deleteUser(email) {
    if (email === 'admin@powerhaus.fit' || email === 'admin') {
        alert("Protección de sistema: No puedes eliminar al administrador principal.");
        return;
    }
    
    // Asignar email seleccionado y mostrar modal
    emailToDelete = email;
    const modal = document.getElementById('deleteModal');
    const card = document.getElementById('deleteModalCard');
    
    modal.classList.remove('hidden');
    
    // Pequeño delay para la animación CSS
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeDeleteModal() {
    emailToDelete = null;
    const modal = document.getElementById('deleteModal');
    const card = document.getElementById('deleteModalCard');
    
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

async function confirmDeleteUser() {
    if (emailToDelete) {
        await fetch('/api/users/' + emailToDelete, { method: 'DELETE' });
        window.location.reload();
    }
}

let toastEl;
function showToast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#1e293b;color:#fff;padding:.85rem 1.5rem;border-radius:1rem;font-weight:700;font-size:.85rem;box-shadow:0 8px 30px rgba(0,0,0,.3);transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;opacity:0;z-index:9999;';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.transform = 'translateY(0)';
  toastEl.style.opacity = '1';
  setTimeout(()=>{ toastEl.style.transform='translateY(80px)'; toastEl.style.opacity='0'; }, 2000);
}

function editUser(email) {
    if(email === 'admin@powerhaus.fit' || email === 'admin') {
        alert("Sistema: No puedes modificar los parámetros del administrador maestro desde aquí.");
        return;
    }
    localStorage.setItem('userToEdit', email);
    window.location.href = 'editar_usuario.html';
}

async function loadEquiposRegistrados() {
    try {
        const licRes = await fetch('/api/license/session');
        if (licRes.ok) {
            const licData = await licRes.json();
            if (licData.ok && licData.licenseKey) {
                document.getElementById('ajustes-license-key').innerText = `Licencia Activa: ${licData.licenseKey}`;
            } else {
                document.getElementById('ajustes-license-key').innerText = `Sin registrar`;
            }

            if (licData.machineInfo) {
                document.getElementById('ajustes-machine-name').innerText = licData.machineInfo.computerName || 'Desconocido';
                document.getElementById('ajustes-machine-os').innerText = `OS: ${licData.machineInfo.osVersion} (${licData.machineInfo.platform})`;
                document.getElementById('ajustes-machine-id').innerText = `ID: ${licData.machineInfo.hardwareId || 'Desconocido'}`;
            }
        }
    } catch (e) {
        console.error("Error loading equipos registrados", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEquiposRegistrados();
});
