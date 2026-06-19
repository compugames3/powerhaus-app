import os

filepath = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\carrito.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """        paginatedItems.forEach((item, innerIndex) => {
            const index = startIndex + innerIndex;
            const itemSubtotal = item.price * item.quantity;
            
            html += `
                <div class="bg-white rounded-[24px] p-6 pr-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6 relative group hover:shadow-xl transition-all duration-300 mb-6">
                    <button onclick="removeItem(${index})" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>"""

replacement = """        const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
        const isEmpleado = sessionData.rol === 'Empleados';
        const isAdmin = sessionData.rol === 'Admin';
        const hasDeletePerm = sessionData.perms && sessionData.perms.includes('Eliminar del Carrito');
        const canDelete = isAdmin || (isEmpleado && hasDeletePerm) || (!isEmpleado);

        paginatedItems.forEach((item, innerIndex) => {
            const index = startIndex + innerIndex;
            const itemSubtotal = item.price * item.quantity;
            
            html += `
                <div class="bg-white rounded-[24px] p-6 pr-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6 relative group hover:shadow-xl transition-all duration-300 mb-6">
                    ${canDelete ? `
                    <button onclick="removeItem(${index})" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                    ` : ''}"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("carrito.html updated successfully")
else:
    print("Target not found in carrito.html")
