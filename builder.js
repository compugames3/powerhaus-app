const fs = require('fs');

const baseHtml = fs.readFileSync('base.txt', 'utf8');

const mainBody = 
<!-- Main Content Space -->
<div class="relative bg-slate-50 flex-1 min-h-[500px]">
    <!-- Blue Header Background -->
    <div class="absolute top-0 left-0 w-full h-48 bg-blue-600 z-0 flex flex-col justify-end pb-8 pl-[10%]">
        <!-- Background watermark -->
        <span class="material-symbols-outlined absolute right-10 -bottom-10 text-[200px] text-white/5 notranslate select-none" translate="no" style="font-variation-settings: 'FILL' 1;">fitness_center</span>
        <!-- Breadcrumbs -->
        <div class="text-white/80 text-xs font-bold tracking-widest uppercase flex items-center gap-2 relative z-10 hidden sm:flex pt-4">
            <span class="cursor-pointer hover:text-white transition-colors" onclick="window.location.href='administrador.html'">Panel</span>
            <span class="material-symbols-outlined text-[10px]" translate="no">chevron_right</span>
            <span class="cursor-pointer hover:text-white transition-colors" onclick="window.location.href='gestion de miembros.html'">Miembros</span>
            <span class="material-symbols-outlined text-[10px]" translate="no">chevron_right</span>
            <span class="text-white">Perfil Avanzado</span>
        </div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-12">
        
        <!-- Big Profile Card -->
        <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 mb-8 border border-white relative overflow-hidden">
            <!-- Profile Avatar & Details -->
            <div class="relative group shrink-0">
                <div class="w-24 h-24 sm:w-32 sm:h-32 bg-slate-200 rounded-3xl overflow-hidden shadow-md shadow-slate-300 flex items-center justify-center text-5xl font-black text-white bg-gradient-to-tr from-slate-400 to-slate-200" id="profileInicial">A</div>
                <div id="profilePhoto" class="absolute inset-0 hidden rounded-3xl overflow-hidden shadow-md shadow-slate-300">
                     <img src="" class="w-full h-full object-cover" id="profileImg" />
                </div>
                <!-- Status Badge -->
                <div class="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-[3px] border-white shadow-sm" id="profileState">ACTIVO</div>
            </div>
            
            <div class="flex-1 text-center lg:text-left flex flex-col xl:flex-row justify-between items-center xl:items-center gap-6">
                <!-- Info Grid -->
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                    <div class="flex flex-col text-center lg:text-left">
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">MIEMBRO</span>
                        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight" id="profileName">Cargando...</h2>
                        <a href="#" class="text-xs font-semibold text-slate-500 hover:text-blue-600 hover:underline transition-colors mt-0.5" id="profileEmail">...</a>
                    </div>
                    
                    <div class="w-px h-12 bg-slate-100 hidden sm:block mt-1"></div>
                    
                    <div class="flex flex-col items-center sm:items-start">
                        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">MEMBRESÍA</span>
                        <div class="flex items-center gap-1.5 text-slate-700 mt-1">
                            <span class="material-symbols-outlined text-blue-500 text-lg notranslate" translate="no" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                            <span class="font-extrabold text-sm" id="profilePlan">Gold Elite</span>
                        </div>
                    </div>

                    <div class="w-px h-12 bg-slate-100 hidden sm:block mt-1"></div>
                    
                    <div class="flex flex-col items-center sm:items-start">
                        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">DESDE</span>
                        <div class="flex items-center gap-1.5 text-slate-700 mt-1">
                            <span class="material-symbols-outlined text-slate-400 text-lg notranslate" translate="no" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
                            <span class="font-extrabold text-sm" id="profileDesde">Ene 2024</span>
                        </div>
                    </div>
                    
                    <div class="w-px h-12 bg-slate-100 hidden sm:block mt-1"></div>
                    
                    <div class="flex flex-col items-center sm:items-start">
                        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">TOTAL VISITAS</span>
                        <div class="flex items-center gap-1.5 text-slate-700 mt-1">
                            <span class="material-symbols-outlined text-slate-400 text-lg notranslate" translate="no" style="font-variation-settings: 'FILL' 1;">bolt</span>
                            <span class="font-extrabold text-sm"><span id="profileVisits">0</span> <span class="text-xs font-semibold text-slate-500 ml-0.5">Sesiones</span></span>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="relative z-10">
                     <button class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm text-xs uppercase tracking-wider">
                         <span class="material-symbols-outlined text-sm notranslate" translate="no">edit</span>
                         Editar Perfil
                     </button>
                </div>
            </div>
            
            <!-- Abstract background shape -->
            <div class="absolute right-0 top-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50/80 to-transparent -translate-y-1/3 translate-x-1/4 rounded-full pointer-events-none"></div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button class="bg-white text-blue-600 shadow-sm shadow-blue-100/50 px-6 py-3 rounded-full font-extrabold text-[11px] uppercase tracking-wider whitespace-nowrap border border-blue-50">Asistencia a Clases</button>
            <button class="bg-transparent text-slate-500 hover:bg-white hover:shadow-sm px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors border border-transparent hover:border-slate-100">Historial de Pagos</button>
            <button class="bg-transparent text-slate-500 hover:bg-white hover:shadow-sm px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors border border-transparent hover:border-slate-100">Progreso Físico</button>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            <!-- Left Column (Wider) -->
            <div class="col-span-1 lg:col-span-2 flex flex-col gap-6 sm:gap-8">
                <!-- Últimas Clases section -->
                <div class="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
                    <div class="flex items-center justify-between mb-8">
                        <h3 class="text-[17px] font-extrabold text-slate-800">Últimas Clases</h3>
                        <a href="calendario.html" class="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-1.5 rounded-full">Ver todo <span class="material-symbols-outlined text-sm" translate="no">arrow_forward</span></a>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[500px]">
                            <thead>
                                <tr class="text-[9px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 text-left">
                                    <th class="pb-4 pl-2">Fecha</th>
                                    <th class="pb-4">Clase</th>
                                    <th class="pb-4">Coach</th>
                                    <th class="pb-4 text-right pr-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="table-clases" class="text-sm">
                                <tr>
                                    <td colspan="4" class="text-center py-8 text-slate-400 font-bold text-xs italic">Cargando clases...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagos Recientes -->
                <div class="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                    <h3 class="text-[17px] font-extrabold text-slate-800 mb-6">Pagos Recientes</h3>
                    <div class="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                       <div class="flex items-center gap-4">
                           <div class="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-200/50">
                               <span class="material-symbols-outlined notranslate" translate="no">receipt_long</span>
                           </div>
                           <div>
                               <p class="font-bold text-slate-800 text-xs sm:text-sm">Membresia Mensual - Actual</p>
                               <p class="text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5">Pagado recientemente</p>
                           </div>
                       </div>
                       <div class="text-right">
                           <p class="font-extrabold text-slate-800 text-sm">$--.--</p>
                           <p class="text-[9px] text-blue-600 font-black tracking-widest uppercase mt-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded-lg border border-blue-100">Éxito</p>
                       </div>
                    </div>
                </div>
            </div>

            <!-- Right Column (Narrower) -->
            <div class="col-span-1 flex flex-col gap-6 sm:gap-8">
                <!-- Progreso Mensual -->
                <div class="bg-blue-50 rounded-[2rem] p-6 sm:p-8 border border-blue-100 relative overflow-hidden shadow-inner">
                    <span class="text-[9px] uppercase tracking-widest font-black text-blue-500 mb-1 block">Progreso Mensual</span>
                    <div class="flex items-baseline gap-2 mb-2">
                        <h4 class="text-4xl font-black text-blue-700" id="progressVal">+0%</h4>
                        <span class="text-xs font-bold text-blue-800">Participación</span>
                    </div>
                    <p class="text-[10px] text-blue-600/70 font-bold mb-8">Comparado con el mes total.</p>
                    
                    <!-- SVG Dial -->
                    <div class="relative w-full aspect-[2/1] overflow-hidden flex justify-center">
                        <!-- Half circle gauge background -->
                        <svg viewBox="0 0 100 50" class="w-[85%] overflow-visible">
                            <!-- Background track -->
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#bfdbfe" stroke-width="10" stroke-linecap="round"/>
                            <!-- Fill track -->
                            <path id="gaugeLine" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#2563eb" stroke-width="10" stroke-linecap="round" stroke-dasharray="125" stroke-dashoffset="125" class="transition-all duration-1000 ease-out"/>
                            <!-- Text overlay inside gauge -->
                            <rect x="35" y="35" width="30" height="15" fill="#2563eb" rx="4"></rect>
                            <text x="50" y="46" font-family="Manrope" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" id="gaugeText">0%</text>
                            <!-- Divider base shadow -->
                            <line x1="20" y1="50" x2="80" y2="50" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                        <p class="absolute -bottom-2 text-[8px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1"><span class="w-1.5 h-1.5 bg-blue-300 rounded-full inline-block"></span> Objetivo Trimestral</p>
                    </div>
                    
                    <!-- Arrow decoration -->
                    <span class="material-symbols-outlined absolute right-4 bottom-4 text-blue-200 text-6xl rotate-[-30deg] notranslate" translate="no" style="font-variation-settings: 'FILL' 1, 'wght' 200;">trending_up</span>
                </div>

                <!-- Notas del Entrenador -->
                <div class="bg-white rounded-[2rem] p-6 sm:p-7 shadow-sm border-2 border-blue-600 relative overflow-hidden group">
                    <h3 class="text-[13px] font-extrabold text-slate-800 mb-5 relative z-10">Notas del Entrenador</h3>
                    
                    <div class="flex gap-3 relative z-10">
                        <div class="w-6 h-6 shrink-0 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                             <span class="material-symbols-outlined text-[13px] notranslate" translate="no">chat_bubble</span>
                        </div>
                        <div>
                            <p class="text-[11px] text-slate-600 leading-relaxed font-bold italic mb-4" id="coachNote">"Este atleta ha mostrado gran compromiso en las clases esta semana. Su resistencia cardiovascular está mejorando notablemente."</p>
                            <div class="flex items-center justify-end gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                 <span class="w-4 h-px bg-slate-300"></span> Coach Principal
                            </div>
                        </div>
                    </div>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full pointer-events-none -z-0"></div>
                </div>
            </div>
        </div>
    </div>
</div>
</main>
<style>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let nombreMiembro = urlParams.get('nombre');
        
        if (!nombreMiembro) {
             window.location.href = 'gestion de miembros.html';
             return;
        }
        
        document.getElementById('profileName').innerText = nombreMiembro;
        document.getElementById('profileInicial').innerText = nombreMiembro.charAt(0).toUpperCase();

        try {
            // Load user profile details
            const usersReq = await fetch('/api/users');
            const users = await usersReq.json();
            const userData = users.find(u => (u.name || '').toLowerCase() === nombreMiembro.toLowerCase());
            
            if (userData) {
                document.getElementById('profilePlan').innerText = userData.plan || 'Plan Standard';
                document.getElementById('profileState').innerText = userData.state === 'Active' ? 'ACTIVO' : 'INACTIVO';
                document.getElementById('profileEmail').innerText = userData.email || 'Sin Correo';
                
                if (userData.state === 'Inactive') {
                    document.getElementById('profileState').classList.replace('bg-blue-600', 'bg-slate-400');
                    document.getElementById('profileState').classList.replace('border-white', 'border-slate-100');
                }
                if (userData.photo) {
                    document.getElementById('profileImg').src = userData.photo;
                    document.getElementById('profilePhoto').classList.remove('hidden');
                }
            } else {
                document.getElementById('profilePlan').innerText = 'Registrado (Generado)';
            }

            // Fetch classes to extract history
            const classReq = await fetch('/api/classes');
            const classes = await classReq.json();
            
            let historial = classes.filter(c => c.inscritos && c.inscritos.includes(nombreMiembro));
            historial.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

            const table = document.getElementById('table-clases');
            if(historial.length === 0) {
                table.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-400 font-bold text-xs italic">No hay historial de clases aplicable.</td></tr>';
            } else {
                table.innerHTML = '';
            }

            let realizadosCant = 0;

            historial.forEach(c => {
                const status = (c.asistencia && c.asistencia[nombreMiembro]) || 'Pendiente';
                let statusClasses = "text-slate-500 font-black tracking-widest";
                let statusTexto = "Completado";
                
                if (status === 'Realizado') {
                     statusClasses = "text-blue-600 font-black tracking-widest";
                     statusTexto = "Realizado";
                     realizadosCant++;
                } else if (status === 'Pendiente') {
                     statusClasses = "text-amber-600 font-black tracking-widest";
                     statusTexto = "Pendiente";
                } else {
                     statusClasses = "text-red-500 font-black tracking-widest"; 
                     statusTexto = status;
                }
                
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors";
                tr.innerHTML = \
                    <td class="py-4 pl-2 font-bold text-slate-500 text-[11px]">\</td>
                    <td class="py-4 font-extrabold text-slate-800 text-[12px]">\</td>
                    <td class="py-4 text-[11px] font-semibold text-slate-500">\</td>
                    <td class="py-4 text-right pr-2">
                        <span class="text-[10px] uppercase \">\</span>
                    </td>
                \;
                table.appendChild(tr);
            });

            document.getElementById('profileVisits').innerText = realizadosCant;

            // Update Progress Percentage
            let percent = 0;
            if (historial.length > 0) {
                percent = Math.round((realizadosCant / historial.length) * 100);
            }
            
            // Animar gauge SVG (Max length 125 represents 180 degrees)
            setTimeout(() => {
                 document.getElementById('gaugeText').innerHTML = percent + '%';
                 document.getElementById('progressVal').innerText = '+' + percent + '%';
                 const offset = 125 - (125 * (percent / 100));
                 document.getElementById('gaugeLine').style.strokeDashoffset = offset;
            }, 300);

            // Personalized Coach Quote (Optional Flavor Text)
            if(percent > 80) {
                 document.getElementById('coachNote').innerText = \"\ ha sido una máquina imparable este mes. Su disciplina marcará la diferencia totalmente."\;
            } else if (percent > 40) {
                 document.getElementById('coachNote').innerText = \"\ mantiene una racha decente, asegurémonos de que siga motivado y no falte."\;
            } else {
                 document.getElementById('coachNote').innerText = \"Es importante hacer seguimiento a \ para incentivar más recurrencia en las sesiones y no perder el ritmo."\;
            }

        } catch (e) {
            console.error(e);
        }
    });

    async function cerrarSesion() {
        try { await fetch('/api/shutdown', { method: 'POST' }); } catch(e) {}
        localStorage.removeItem('usuario_activo');
        localStorage.removeItem('userToEdit');
        window.location.href = 'index.html';
    }
</script>
</body>
</html>
\

fs.writeFileSync('perfil_miembro.html', baseHtml + mainBody);
