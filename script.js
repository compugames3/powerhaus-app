
    function switchTab(tabId) {
        // Tab styling toggles
        const btnClases = document.getElementById('tab-clases');
        const btnPagos = document.getElementById('tab-pagos');
        const btnConsumos = document.getElementById('tab-consumos');
        
        const activeClasses = "bg-white text-[#004cf0] shadow-sm shadow-blue-100/50 border-blue-50 border transition-all".split(' ');
        const inactiveClasses = "bg-transparent text-slate-500 hover:bg-white hover:shadow-sm transition-colors border border-transparent hover:border-slate-100".split(' ');
        
        if(tabId === 'clases') {
             btnClases.classList.add(...activeClasses);
             btnClases.classList.remove(...inactiveClasses);
             btnPagos.classList.add(...inactiveClasses);
             if(btnConsumos) { btnConsumos.classList.add(...inactiveClasses); btnConsumos.classList.remove(...activeClasses); }
             btnPagos.classList.remove(...activeClasses);
             
             document.getElementById('view-clases').classList.remove('hidden');
             document.getElementById('view-clases').classList.add('grid');
             document.getElementById('view-pagos').classList.add('hidden');
             document.getElementById('view-pagos').classList.remove('flex');
             if (document.getElementById('view-consumos')) { document.getElementById('view-consumos').classList.add('hidden'); document.getElementById('view-consumos').classList.remove('flex'); }
        } else if(tabId === 'pagos') {
             btnPagos.classList.add(...activeClasses);
             btnPagos.classList.remove(...inactiveClasses);
             btnClases.classList.add(...inactiveClasses);
             if(btnConsumos) { btnConsumos.classList.add(...inactiveClasses); btnConsumos.classList.remove(...activeClasses); }
             btnClases.classList.remove(...activeClasses);
             
             document.getElementById('view-clases').classList.add('hidden');
             document.getElementById('view-clases').classList.remove('grid');
             if (document.getElementById('view-consumos')) { document.getElementById('view-consumos').classList.add('hidden'); document.getElementById('view-consumos').classList.remove('flex'); }
             document.getElementById('view-pagos').classList.remove('hidden');
             document.getElementById('view-pagos').classList.add('flex');
        } else if(tabId === 'consumos') {
             if(btnConsumos) { btnConsumos.classList.add(...activeClasses); btnConsumos.classList.remove(...inactiveClasses); }
             btnClases.classList.add(...inactiveClasses); btnClases.classList.remove(...activeClasses);
             btnPagos.classList.add(...inactiveClasses); btnPagos.classList.remove(...activeClasses);
             
             document.getElementById('view-clases').classList.add('hidden');
             document.getElementById('view-clases').classList.remove('grid');
             document.getElementById('view-pagos').classList.add('hidden');
             document.getElementById('view-pagos').classList.remove('flex');
             if(document.getElementById('view-consumos')) { 
                 document.getElementById('view-consumos').classList.remove('hidden'); 
                 document.getElementById('view-consumos').classList.add('flex'); 
             }
        }
    }


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
            const usersReq = await fetch('/api/users?t=' + Date.now(), { cache: 'no-store' });
            const users = await usersReq.json();
            let searchedName = nombreMiembro.trim().toLowerCase();
            let userData = users.find(u => (u.name || '').trim().toLowerCase() === searchedName && (!u.role || u.role.toLowerCase() === 'miembro'));
            if (!userData) userData = users.find(u => (u.name || '').trim().toLowerCase() === searchedName);
            
            if (userData) {
                document.getElementById('profilePlan').innerText = userData.plan || 'Plan Standard';
                document.getElementById('profileState').innerText = userData.state === 'Active' ? 'ACTIVO' : 'INACTIVO';
                document.getElementById('profileEmail').innerText = userData.email || 'Sin Correo';
                
                
                let mesesArray = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                
                if (userData.id) {
                    const d = new Date(userData.id);
                    document.getElementById('profileDesde').innerText = `${mesesArray[d.getMonth()]} ${d.getFullYear()}`;
                }

                // Generador de Pagos
                document.getElementById('pagosPlanActual').innerText = userData.plan || 'Plan Standard';
                const pagosCards = document.getElementById('table-pagos-recientes');
                const pagosHistorial = document.getElementById('table-pagos-historial');
                pagosCards.innerHTML = '';
                pagosHistorial.innerHTML = '';
                
                let totalPagado = 0;
                
                // Inicializar matriz de pagos temporal si no existe o generarla retroactivamente para demo
                if (!userData.payments && userData.id) {
                    userData.payments = [];
                    let d = new Date(userData.id);
                    let currentDate = new Date();
                    let numPagos = Math.max(1, (currentDate.getFullYear() - d.getFullYear()) * 12 + (currentDate.getMonth() - d.getMonth()) + 1);
                    if (numPagos > 6) numPagos = 6;
                    
                    for(let i=0; i<numPagos; i++) {
                        let pagoDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, Math.min(25, new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0).getDate()));
                        let isVencido = (i === 0 && userData.state === 'Inactive');
                        let baseMonto = userData.planPrice !== undefined ? parseFloat(userData.planPrice) : (userData.plan && userData.plan.toLowerCase().includes('elite') ? 89.99 : 45.00);
                        let descripcion = i % 2 === 0 ? `Membresía Mensual - ${mesesArray[pagoDate.getMonth()]}` : 'Suplementos Whey Protein';
                        let icono = i % 2 === 0 ? 'receipt_long' : 'medication';
                        
                        userData.payments.push({
                            date: pagoDate.getTime(),
                            amount: baseMonto,
                            status: isVencido ? 'Vencido' : 'ÉXITO',
                            desc: descripcion,
                            icon: icono
                        });
                    }
                }
                
                if(userData.payments && userData.payments.length > 0) {
                    userData.payments.forEach((pago, index) => {
                        let pd = new Date(pago.date);
                        let fechaFormatTabla = `${pd.getDate().toString().padStart(2, '0')} ${mesesArray[pd.getMonth()]} ${pd.getFullYear()}`;
                        let fechaFormatReciente = `${pd.getDate().toString().padStart(2, '0')}/${(pd.getMonth()+1).toString().padStart(2, '0')}/${pd.getFullYear()}`;
                        
                        if (pago.status !== 'Vencido') {
                            totalPagado += pago.amount;
                        }
                        
                        // Generar componente Tabla Completa
                        let estadoEstilo = pago.status === 'Vencido' ? "text-[#ba1a1a] bg-red-50 border border-red-100" : "text-[#004cf0] bg-[#eef0ff] border border-blue-100";
                        let estadoTexto = pago.status === 'Vencido' ? "Vencido" : "Exitoso";
                        
                        pagosHistorial.innerHTML += `
                            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 pl-2 font-bold text-slate-500 text-[11px]">${fechaFormatTabla}</td>
                                <td class="py-4 font-extrabold text-slate-800 text-[12px]">${pago.desc}</td>
                                <td class="py-4 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">credit_card</span> Tarjeta
                                </td>
                                <td class="py-4 font-black text-slate-700 text-sm">$${pago.amount.toFixed(2)}</td>
                                <td class="py-4 text-right pr-2">
                                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block ${estadoEstilo}">${estadoTexto}</span>
                                </td>
                            </tr>
                        `;

                        // Generar componente Cards Recientes
                        if (index < 3) {
                            let recEstadoCls = pago.status === 'Vencido' ? "text-[#ba1a1a]" : "text-[#004cf0]";
                            let recEstado = pago.status === 'Vencido' ? "VENCIDO" : "ÉXITO";
                            
                            pagosCards.innerHTML += `
                                <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm shadow-blue-900/5 flex items-center justify-between border border-transparent hover:border-blue-50 transition-colors">
                                    <div class="flex items-center gap-5">
                                        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[#eef0ff] text-[#004cf0] shadow-inner shrink-0">
                                            <span class="material-symbols-outlined text-[20px] sm:text-[24px]" translate="no">${pago.icon}</span>
                                        </div>
                                        <div>
                                            <p class="font-extrabold text-slate-800 text-[14px] sm:text-[15px] mb-0.5">${pago.desc}</p>
                                            <p class="text-[12px] text-slate-500 font-medium">Pagado el ${fechaFormatReciente}</p>
                                        </div>
                                    </div>
                                    <div class="text-right pl-2">
                                        <p class="font-extrabold text-slate-800 text-[15px] sm:text-[17px] mb-1">$${pago.amount.toFixed(2)}</p>
                                        <p class="uppercase text-[10px] font-black tracking-widest ${recEstadoCls}">${recEstado}</p>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    
                    document.getElementById('pagosTotalMonto').innerText = '$' + totalPagado.toFixed(2);
                    if (userData.state === 'Inactive') {
                        document.getElementById('pagosEstadoPlan').innerHTML = '<span class="material-symbols-outlined text-xl" translate="no">error</span> Suspendido';
                        document.getElementById('pagosEstadoPlan').classList.replace('text-blue-700', 'text-[#ba1a1a]');
                    }
                    
                    // Lógica de expiración dinámica basada en el último pago
                    let lastPayment = new Date(userData.payments[0].date);
                    let diffDays = Math.floor((Date.now() - lastPayment.getTime()) / (1000 * 3600 * 24));
                    let daysLeft = 30 - diffDays;
                    if (daysLeft < 0) daysLeft = 0;
                    document.getElementById('renovacionDesc').innerText = `Su membresía ${userData.plan || 'Standard'} vence en ${daysLeft} días.`;
                    
                } else {
                     pagosCards.innerHTML = '<div class="text-center py-8 text-slate-400 font-bold text-xs">Información no disponible.</div>';
                     pagosHistorial.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400 font-bold text-xs italic">Sin registros de pago.</td></tr>';
                     document.getElementById('renovacionDesc').innerText = `Membresía inactiva.`;
                }

                // Lógica de validación para BOTÓN RENOVAR AHORA
                const btnRenovarAhora = document.getElementById('btnRenovarAhora');
                if (btnRenovarAhora) {
                    btnRenovarAhora.onclick = () => {
                        let isYaActivo = (userData.state === 'Active' && userData.payments && userData.payments.length > 0 && userData.payments[0].status === 'ÉXITO');
                        let titlePrompt = isYaActivo ? "¿Renovar de nuevo?" : "¿Proceder con Renovación?";
                        let textDesc = isYaActivo ? "El miembro ya tiene un mes pago en curso. ¿Estás seguro que deseas registrar una nueva renovación de membresía por adelantado?" : "¿Estás seguro que deseas registrar una nueva renovación de membresía y marcar la cuenta como al día?";

                        Swal.fire({
                            title: titlePrompt,
                            text: textDesc,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#004cf0',
                            cancelButtonColor: '#ba1a1a',
                            confirmButtonText: 'Sí, registrar',
                            cancelButtonText: 'No, cancelar'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                let baseMonto = userData.planPrice !== undefined ? parseFloat(userData.planPrice) : (userData.plan && userData.plan.toLowerCase().includes('elite') ? 89.99 : 45.00);
                                let currentDate = new Date();
                                
                                userData.state = 'Active';
                                userData.payments = userData.payments || [];
                                
                                if (userData.payments.length > 0 && userData.payments[0].status === 'Vencido') {
                                    userData.payments[0].status = 'ÉXITO';
                                    userData.payments[0].date = Date.now();
                                } else {
                                    let newPago = {
                                        date: Date.now(),
                                        amount: baseMonto,
                                        status: 'ÉXITO',
                                        desc: `Membresía Mensual - ${mesesArray[currentDate.getMonth()]}`,
                                        icon: 'receipt_long'
                                    };
                                    userData.payments.unshift(newPago);
                                }
                                
                                try {
                                    let identifier = userData.id ? String(userData.id) : userData.email;
                                    const resp = await fetch('/api/users/' + encodeURIComponent(identifier), {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ state: userData.state, payments: userData.payments })
                                    });
                                    if(resp.ok) {
                                        Swal.fire('¡Renovación Exitosa!', 'El pago ha sido registrado en la base de datos y en el historial.', 'success').then(() => {
                                            window.location.reload();
                                        });
                                    } else {
                                        Swal.fire('Error', 'No se pudo guardar la renovación.', 'error');
                                    }
                                } catch(e) {
                                    console.error(e);
                                    Swal.fire('Error de red', 'No hay conexión con la base de datos.', 'error');
                                }
                            }
                        });
                    };
                }


                document.getElementById('profileWeight').innerText = userData.weight ? userData.weight + ' kg' : '--';
                document.getElementById('profileHeight').innerText = userData.height ? userData.height + ' cm' : '--';
                document.getElementById('profileNivel').innerText = userData.estadoFisico || '--';
                document.getElementById('profileDob').innerText = userData.dob || '--';
                
                document.getElementById('btnEditProfile').onclick = () => {
                    if (userData) {
                        let editId = userData.id ? String(userData.id) : userData.email;
                        localStorage.setItem('userToEdit', JSON.stringify(userData));
                        window.location.href = 'nuevo_miembro.html?edit=' + encodeURIComponent(editId);
                    }
                };

                if (userData.state === 'Inactive') {
                    document.getElementById('profileState').classList.replace('bg-[#004cf0]', 'bg-slate-400');
                    document.getElementById('profileState').classList.replace('border-white', 'border-slate-100');
                }
                if (userData.photo) {
                    document.getElementById('profileImg').src = userData.photo;
                    document.getElementById('profilePhoto').classList.remove('hidden');
                }


                // Generar Consumos
                const tablaConsumos = document.getElementById('table-consumos-historial');
                if (tablaConsumos) {
                    if (userData.consumos && userData.consumos.length > 0) {
                        tablaConsumos.innerHTML = '';
                        const consumosList = [...userData.consumos];
                        consumosList.sort((a,b) => b.fecha.localeCompare(a.fecha));
                        
                        consumosList.forEach(c => {
                            let pd = new Date(c.fecha);
                            let fechaFormat = pd.getDate().toString().padStart(2, '0') + '/' + (pd.getMonth()+1).toString().padStart(2, '0') + '/' + pd.getFullYear() + ' ' + pd.getHours().toString().padStart(2,'0') + ':' + pd.getMinutes().toString().padStart(2,'0');
                            
                            let itemsStr = c.items.map(item => '<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold mr-1 inline-block">' + item.quantity + 'x ' + item.name + '</span>').join(' ');
                            
                            tablaConsumos.innerHTML += `
                                <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td class="py-4 pl-2 font-bold text-slate-500 text-[11px]">${fechaFormat}</td>
                                    <td class="py-4 text-[12px]">${itemsStr}</td>
                                    <td class="py-4 font-black text-slate-700 text-sm text-right pr-2">
                                        <span class="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">+$${c.totalMonto.toFixed(2)}</span>
                                    </td>
                                </tr>
                            `;
                        });
                    } else {
                        tablaConsumos.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-slate-400 font-bold text-xs italic">No hay registros de consumos o artículos comprados.</td></tr>';
                    }
                }
                
                if (urlParams.get('tab') === 'consumos') {
                    setTimeout(() => switchTab('consumos'), 100);
                }
            } else {
                document.getElementById('profilePlan').innerText = 'Registrado (Generado)';
            }

            // Fetch classes to extract history
            const classReq = await fetch('/api/classes?t=' + Date.now(), { cache: 'no-store' });
            const classes = await classReq.json();
            
            let historial = classes.filter(c => c.inscritos && c.inscritos.includes(nombreMiembro));
            historial.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

            const table = document.getElementById('table-clases');
            if(historial.length === 0) {
                table.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-400 font-bold text-xs italic">No hay historial de clases para este miembro.</td></tr>';
            } else {
                table.innerHTML = '';
            }

            let realizadosCant = 0;

            historial.slice(0, 8).forEach(c => {
                const status = (c.asistencia && c.asistencia[nombreMiembro]) || 'Pendiente';
                let statusClasses = "text-slate-500 font-black tracking-widest";
                let statusTexto = "Completado";
                
                if (status === 'Realizado') {
                     statusClasses = "text-[#004cf0] font-black tracking-widest";
                     statusTexto = "Realizado";
                     realizadosCant++;
                } else if (status === 'Pendiente') {
                     statusClasses = "text-[#ba1a1a] font-black tracking-widest"; // Red color
                     statusTexto = "Ausente"; 
                } else {
                     statusClasses = "text-red-500 font-black tracking-widest"; 
                     statusTexto = status;
                }
                
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors";
                tr.innerHTML = `
                    <td class="py-4 pl-2 font-bold text-slate-500 text-[11px]">${c.fecha}</td>
                    <td class="py-4 font-extrabold text-slate-800 text-[12px]">${c.nombre || 'Clase de Entrenamiento'}</td>
                    <td class="py-4 text-[11px] font-semibold text-slate-500">${c.entrenador || 'Staff'}</td>
                    <td class="py-4 text-right pr-2">
                        <span class="text-[10.5px] uppercase ${statusClasses}">${statusTexto}</span>
                    </td>
                `;
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

            // Personalized Coach Quote
            if(percent >= 80) {
                 document.getElementById('coachNote').innerText = '"' + nombreMiembro.split(' ')[0] + ' ha sido una máquina imparable este mes. Su disciplina marcará la diferencia y lo encamina al éxito total."';
            } else if (percent >= 40) {
                 document.getElementById('coachNote').innerText = '"' + nombreMiembro.split(' ')[0] + ' mantiene una constancia decente, pero asegurémonos de que siga motivado para no perder el ritmo."';
            } else {
                 document.getElementById('coachNote').innerText = '"Es importante hacer seguimiento a ' + nombreMiembro.split(' ')[0] + ' para incentivar su recurrencia en las sesiones y mejorar el resultado."';
            }

        } catch (e) {
            console.error(e);
            document.getElementById('profileName').innerText = "Error cargando";
        }
    });



