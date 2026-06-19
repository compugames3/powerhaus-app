import re

with open('administrador.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace HTML
html_pattern = r'<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">.*?</div>\s*<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">'
replacement_html = '''<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Total Miembros -->
                <div class="bg-surface-container-lowest rounded-xxl p-6 relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div class="flex justify-between items-start mb-4">
                        <p class="tracking-wider uppercase text-xs font-bold text-slate-500">Total Miembros</p>
                        <span class="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg notranslate" translate="no">group</span>
                    </div>
                    <h3 class="text-5xl font-extrabold text-on-background tracking-tighter mb-1" id="dash-total-miembros">0</h3>
                    <p class="text-sm text-primary font-semibold flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs notranslate" translate="no">trending_up</span>
                        Usuarios Registrados
                    </p>
                </div>
                <!-- Total Entrenadores -->
                <div class="bg-surface-container-lowest rounded-xxl p-6 relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
                    <div class="flex justify-between items-start mb-4">
                        <p class="tracking-wider uppercase text-xs font-bold text-slate-500">Total Entrenadores</p>
                        <span class="material-symbols-outlined text-emerald-600 bg-emerald-100 p-2 rounded-lg notranslate" translate="no">sports</span>
                    </div>
                    <h3 class="text-5xl font-extrabold text-on-background tracking-tighter mb-1" id="dash-total-entrenadores">0</h3>
                    <p class="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs notranslate" translate="no">fitness_center</span>
                        Staff y Coaches
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">'''

html = re.sub(html_pattern, replacement_html, html, flags=re.DOTALL)

with open('administrador.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('HTML Replaced')
