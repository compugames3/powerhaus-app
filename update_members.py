import os

# Update gestion de miembros.html (Eliminar Miembros)
filepath_gestion = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\gestion de miembros.html"
with open(filepath_gestion, "r", encoding="utf-8") as f:
    gestion_content = f.read()

target_gestion = """            const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
            const isEmpleado = sessionData.rol === 'Empleados';
           
            const tr = document.createElement('tr');"""

new_gestion = """            const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
            const isEmpleado = sessionData.rol === 'Empleados';
            const isAdmin = sessionData.rol === 'Admin';
            const hasDeletePerm = sessionData.perms && sessionData.perms.includes('Eliminar Miembros/Entrenadores');
            const canDelete = isAdmin || (isEmpleado && hasDeletePerm) || (!isEmpleado);
           
            const tr = document.createElement('tr');"""

target_gestion_button = """                    ${!isEmpleado ? `
                    <button class="p-2 text-slate-400 hover:text-red-500 transition-colors" onclick="event.stopPropagation(); deleteMember('${m.id || m.email}', '${m.name}')">"""

new_gestion_button = """                    ${canDelete ? `
                    <button class="p-2 text-slate-400 hover:text-red-500 transition-colors" onclick="event.stopPropagation(); deleteMember('${m.id || m.email}', '${m.name}')">"""

if target_gestion in gestion_content and target_gestion_button in gestion_content:
    gestion_content = gestion_content.replace(target_gestion, new_gestion)
    gestion_content = gestion_content.replace(target_gestion_button, new_gestion_button)
    with open(filepath_gestion, "w", encoding="utf-8") as f:
        f.write(gestion_content)
    print("gestion de miembros.html updated")
else:
    print("Could not find targets in gestion de miembros.html")


# Update perfil_miembro.html (Editar Miembros)
filepath_perfil = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\perfil_miembro.html"
with open(filepath_perfil, "r", encoding="utf-8") as f:
    perfil_content = f.read()

target_perfil_js = """<script>

    const urlParams = new URLSearchParams(window.location.search);
    const nombreUsuario = urlParams.get('nombre');"""

new_perfil_js = """<script>
    document.addEventListener("DOMContentLoaded", () => {
        const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
        const isEmpleado = sessionData.rol === 'Empleados';
        const isAdmin = sessionData.rol === 'Admin';
        const hasEditPerm = sessionData.perms && sessionData.perms.includes('Editar Miembros/Entrenadores');
        
        const btnEditProfile = document.getElementById('btnEditProfile');
        if (btnEditProfile) {
            if (isEmpleado && !hasEditPerm && !isAdmin) {
                btnEditProfile.style.display = 'none';
            }
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const nombreUsuario = urlParams.get('nombre');"""

if target_perfil_js in perfil_content:
    perfil_content = perfil_content.replace(target_perfil_js, new_perfil_js)
    with open(filepath_perfil, "w", encoding="utf-8") as f:
        f.write(perfil_content)
    print("perfil_miembro.html updated")
else:
    print("Could not find targets in perfil_miembro.html")
