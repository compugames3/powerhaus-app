import os

files_to_update = [
    r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\crear_usuario.html",
    r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\editar_usuario.html"
]

new_labels = """                            <label id="perm-CierreDia" onclick="togglePerm('perm-CierreDia')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Cierre de Día</span>
                            </label>
                            <label id="perm-CierreMes" onclick="togglePerm('perm-CierreMes')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Cierre del Mes</span>
                            </label>
                            <label id="perm-EliminarMiembros" onclick="togglePerm('perm-EliminarMiembros')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Eliminar Miembros/Entrenadores</span>
                            </label>
                            <label id="perm-EditarMiembros" onclick="togglePerm('perm-EditarMiembros')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Editar Miembros/Entrenadores</span>
                            </label>
                            <label id="perm-EditarInventario" onclick="togglePerm('perm-EditarInventario')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Editar Inventario</span>
                            </label>
                            <label id="perm-EliminarInventario" onclick="togglePerm('perm-EliminarInventario')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Eliminar Inventario</span>
                            </label>
                            <label id="perm-EliminarCarrito" onclick="togglePerm('perm-EliminarCarrito')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Eliminar del Carrito</span>
                            </label>
                            <label id="perm-EliminarClases" onclick="togglePerm('perm-EliminarClases')" class="perm-option flex items-center gap-3 cursor-pointer opacity-50">
                                <div class="w-4 h-4 rounded border-2 border-slate-300 bg-transparent flex items-center justify-center"></div>
                                <span class="text-[11px] font-bold text-slate-600">Eliminar Clases</span>
                            </label>
                        </div>"""

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Insert new labels before the closing </div> of the grid
    target_div_end = """                            </label>\n                        </div>"""
    if target_div_end in content:
        content = content.replace(target_div_end, "                            </label>\n" + new_labels.replace('                        </div>', '') + "\n                        </div>")

    # Update PERM_MAP
    target_perm_map = """    const PERM_MAP = {
        'perm-Miembros': 'Gestionar Miembros',
        'perm-Horarios': 'Editar Horarios',
        'perm-Finanzas': 'Registros Financieros',
        'perm-Reservas': 'Reserva de Clases'
    };"""
    
    new_perm_map = """    const PERM_MAP = {
        'perm-Miembros': 'Gestionar Miembros',
        'perm-Horarios': 'Editar Horarios',
        'perm-Finanzas': 'Registros Financieros',
        'perm-Reservas': 'Reserva de Clases',
        'perm-CierreDia': 'Cierre de Día',
        'perm-CierreMes': 'Cierre del Mes',
        'perm-EliminarMiembros': 'Eliminar Miembros/Entrenadores',
        'perm-EditarMiembros': 'Editar Miembros/Entrenadores',
        'perm-EditarInventario': 'Editar Inventario',
        'perm-EliminarInventario': 'Eliminar Inventario',
        'perm-EliminarCarrito': 'Eliminar del Carrito',
        'perm-EliminarClases': 'Eliminar Clases'
    };"""
    
    content = content.replace(target_perm_map, new_perm_map)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Updated {filepath}")
