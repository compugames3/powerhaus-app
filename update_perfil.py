import os

filepath_perfil = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\perfil_miembro.html"
with open(filepath_perfil, "r", encoding="utf-8") as f:
    perfil_content = f.read()

target = """    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);"""

replacement = """    document.addEventListener('DOMContentLoaded', async () => {
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

        const urlParams = new URLSearchParams(window.location.search);"""

if target in perfil_content:
    perfil_content = perfil_content.replace(target, replacement)
    with open(filepath_perfil, "w", encoding="utf-8") as f:
        f.write(perfil_content)
    print("perfil_miembro.html updated")
else:
    print("Target not found in perfil_miembro.html")
