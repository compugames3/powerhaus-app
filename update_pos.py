import os

filepath = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\punto de venta.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """window.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productsGrid');
    const customProds = JSON.parse(localStorage.getItem('inventarioProductos')) || [];
    
    // Add custom products in front of the hardcoded ones
    customProds.reverse().forEach(prod => {
        const el = document.createElement('div');
        el.dataset.category = prod.categoria;
        el.className = 'product-item bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative';
        el.innerHTML = `
            <button onclick="event.stopPropagation(); deleteProduct('${prod.nombre}')" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20" title="Eliminar Producto">
                <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
            <button onclick="event.stopPropagation(); editProduct('${prod.nombre}')" class="absolute top-2 right-12 w-8 h-8 rounded-full bg-white/60 hover:bg-[#0d4cf0] hover:text-white backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20" title="Editar Producto">
                <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>"""

replacement = """window.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productsGrid');
    const customProds = JSON.parse(localStorage.getItem('inventarioProductos')) || [];
    
    const sessionData = JSON.parse(localStorage.getItem('usuario_activo') || '{}');
    const isEmpleado = sessionData.rol === 'Empleados';
    const isAdmin = sessionData.rol === 'Admin';
    const hasEditPerm = sessionData.perms && sessionData.perms.includes('Editar Inventario');
    const hasDeletePerm = sessionData.perms && sessionData.perms.includes('Eliminar Inventario');
    const canEdit = isAdmin || (isEmpleado && hasEditPerm) || (!isEmpleado);
    const canDelete = isAdmin || (isEmpleado && hasDeletePerm) || (!isEmpleado);
    
    // Add custom products in front of the hardcoded ones
    customProds.reverse().forEach(prod => {
        const el = document.createElement('div');
        el.dataset.category = prod.categoria;
        el.className = 'product-item bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative';
        
        let actionsHtml = '';
        if (canDelete) {
            actionsHtml += `<button onclick="event.stopPropagation(); deleteProduct('${prod.nombre}')" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20" title="Eliminar Producto">
                <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>`;
        }
        if (canEdit) {
            actionsHtml += `<button onclick="event.stopPropagation(); editProduct('${prod.nombre}')" class="absolute top-2 right-[${canDelete ? '3rem' : '0.5rem'}] w-8 h-8 rounded-full bg-white/60 hover:bg-[#0d4cf0] hover:text-white backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-20" title="Editar Producto">
                <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>`;
        }
        
        el.innerHTML = `
            ${actionsHtml}"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("punto de venta.html updated successfully")
else:
    print("Target not found in punto de venta.html")
