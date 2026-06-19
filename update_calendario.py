import os

filepath = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\calendario.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """    function abrirModalClase(id) {
        const clase = globalClasses.find(c => String(c.id) === String(id));
        if(!clase) return;
        currentClaseId = id;
        
        const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
        const isEmpleado = sessionData.rol === 'Empleados';
        const btnEliminarClase = document.querySelector('button[onclick="eliminarClaseActual()"]');
        if (btnEliminarClase) {
            btnEliminarClase.style.display = isEmpleado ? 'none' : 'block';
        }"""

replacement = """    function abrirModalClase(id) {
        const clase = globalClasses.find(c => String(c.id) === String(id));
        if(!clase) return;
        currentClaseId = id;
        
        const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
        const isEmpleado = sessionData.rol === 'Empleados';
        const isAdmin = sessionData.rol === 'Admin';
        const hasDeletePerm = sessionData.perms && sessionData.perms.includes('Eliminar Clases');
        const canDelete = isAdmin || (isEmpleado && hasDeletePerm) || (!isEmpleado);

        const btnEliminarClase = document.querySelector('button[onclick="eliminarClaseActual()"]');
        if (btnEliminarClase) {
            btnEliminarClase.style.display = canDelete ? 'block' : 'none';
        }"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("calendario.html updated successfully")
else:
    print("Target not found in calendario.html")
