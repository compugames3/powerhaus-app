
    function showErrorModal(text) {
        const modal = document.getElementById('customErrorModal');
        const backdrop = document.getElementById('errorModalBackdrop');
        const content = document.getElementById('errorModalContent');
        const textEl = document.getElementById('errorModalText');
        textEl.innerText = text;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            content.classList.remove('opacity-0', 'scale-95');
            content.classList.add('opacity-100', 'scale-100');
        });
    }

    function closeErrorModal() {
        const modal = document.getElementById('customErrorModal');
        const backdrop = document.getElementById('errorModalBackdrop');
        const content = document.getElementById('errorModalContent');
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        content.classList.remove('opacity-100', 'scale-100');
        content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    


    
    let isEditingPlans = false;
    function toggleEditPlans() {
        isEditingPlans = !isEditingPlans;
        const edits = document.querySelectorAll('.plan-editable');
        const container = document.getElementById('save-plans-container');
        const btn = document.getElementById('btn-edit-plans');
        
        edits.forEach(el => {
            if (isEditingPlans) {
                if (el.tagName === 'SELECT') { el.disabled = false; }
                else { el.removeAttribute('readonly'); }
                el.classList.add('border-b', 'border-slate-300', 'bg-slate-100', 'px-1');
                el.classList.remove('bg-transparent');
            } else {
                if (el.tagName === 'SELECT') { el.disabled = true; }
                else { el.setAttribute('readonly', 'true'); }
                el.classList.remove('border-b', 'border-slate-300', 'bg-slate-100', 'px-1');
                el.classList.add('bg-transparent');
            }
        });
        
        if (isEditingPlans) {
            container.classList.remove('hidden');
            container.classList.add('flex');
            btn.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-300');
        } else {
            container.classList.add('hidden');
            container.classList.remove('flex');
            btn.classList.remove('bg-blue-100', 'text-blue-700', 'border-blue-300');
            // reset logic: load values back if cancelled
            const savedPlanes = JSON.parse(localStorage.getItem('configPlanes') || 'null');
            if (savedPlanes) {
                if(document.getElementById('config-plan1-name')) document.getElementById('config-plan1-name').value = savedPlanes.p1n || "TITAN ELITE";
                if(document.getElementById('config-plan1-price')) document.getElementById('config-plan1-price').value = savedPlanes.p1p || "0";
                if(document.getElementById('config-plan2-name')) document.getElementById('config-plan2-name').value = savedPlanes.p2n || "KINETIC CORE";
                if(document.getElementById('config-plan2-price')) document.getElementById('config-plan2-price').value = savedPlanes.p2p || "0";
                if(document.getElementById('config-plan1-duration') && savedPlanes.p1d) document.getElementById('config-plan1-duration').value = savedPlanes.p1d;
                if(document.getElementById('config-plan2-duration') && savedPlanes.p2d) document.getElementById('config-plan2-duration').value = savedPlanes.p2d;
            }
        }
    }
    
    function confirmSavePlans() {
        savePlanConfig();
        toggleEditPlans(); // close edit mode
        if (typeof showToast !== 'undefined') showToast('✅ Planes actualizados correctamente');
        else alert('✅ Planes actualizados correctamente');
    }

    function savePlanConfig() {
        const p1n = document.getElementById('config-plan1-name') ? document.getElementById('config-plan1-name').value : 'TITAN ELITE';
        const p1p = document.getElementById('config-plan1-price') ? document.getElementById('config-plan1-price').value : '0';
        const p1d = document.getElementById('config-plan1-duration') ? document.getElementById('config-plan1-duration').value : 'mes';
        const p2n = document.getElementById('config-plan2-name') ? document.getElementById('config-plan2-name').value : 'KINETIC CORE';
        const p2p = document.getElementById('config-plan2-price') ? document.getElementById('config-plan2-price').value : '0';
        const p2d = document.getElementById('config-plan2-duration') ? document.getElementById('config-plan2-duration').value : 'mes';
        localStorage.setItem('configPlanes', JSON.stringify({p1n, p1p, p1d, p2n, p2p, p2d}));
    }

    function generarCodigoBarrasAutomatico() {
        const base = String(Date.now()).slice(-6).padStart(6, '0');
        return `PRD-${base}`;
    }

    function asegurarCodigoBarras(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return '';
        const actual = input.value.trim();
        if (actual) {
            input.value = actual.toUpperCase();
            return input.value;
        }
        const generado = generarCodigoBarrasAutomatico();
        input.value = generado;
        return generado;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const telInputs = document.querySelectorAll('input[type="tel"]');
        telInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                if (/[^0-9]/.test(this.value)) {
                    showErrorModal('esto no son numeros');
                    this.value = this.value.replace(/[^0-9]/g, '');
                }
            });
        });

        
        const urlP = new URLSearchParams(window.location.search);
        if (urlP.get('edit')) {
            const edStr = localStorage.getItem('userToEdit');
            if (edStr) {
                try {
                    const edObj = JSON.parse(edStr);
                    setTimeout(() => {
                        if (document.getElementById('barcode-cliente')) document.getElementById('barcode-cliente').value = edObj.barcode || '';
                        if (document.getElementById('barcode-entrenador')) document.getElementById('barcode-entrenador').value = edObj.barcode || '';
                    }, 500);
                } catch(e){}
            }
        }
        const savedPlanes = JSON.parse(localStorage.getItem('configPlanes') || 'null');
        if (savedPlanes) {
            if(document.getElementById('config-plan1-name')) document.getElementById('config-plan1-name').value = savedPlanes.p1n;
            if(document.getElementById('config-plan1-price')) document.getElementById('config-plan1-price').value = savedPlanes.p1p;
            if(document.getElementById('config-plan2-name')) document.getElementById('config-plan2-name').value = savedPlanes.p2n;
            if(document.getElementById('config-plan2-price')) document.getElementById('config-plan2-price').value = savedPlanes.p2p;
            if(document.getElementById('config-plan1-duration') && savedPlanes.p1d) document.getElementById('config-plan1-duration').value = savedPlanes.p1d;
            if(document.getElementById('config-plan2-duration') && savedPlanes.p2d) document.getElementById('config-plan2-duration').value = savedPlanes.p2d;
        }

        if (!urlP.get('edit')) {
            asegurarCodigoBarras('barcode-cliente');
            asegurarCodigoBarras('barcode-entrenador');
        }
    });

    // Specialties logic
    function toggleSpecialty(btn) {
        if (btn.classList.contains('border-blue-600')) {
            // Make inactive
            btn.className = "px-5 py-2 rounded-full border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all focus:outline-none";
        } else {
            // Make active
            btn.className = "px-5 py-2 rounded-full border-2 border-blue-600 text-blue-700 bg-blue-50/50 text-xs font-bold shadow-sm transition-all focus:outline-none";
        }
    }

    function addSpecialtyFlow() {
        const container = document.getElementById("specialties-container");
        const addBtn = document.getElementById("add-specialty-btn");
        
        addBtn.classList.add("hidden");
        
        const inputPill = document.createElement("input");
        inputPill.type = "text";
        inputPill.className = "px-4 py-1.5 rounded-full border-2 border-blue-600 text-blue-700 bg-white text-xs font-bold shadow-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 transition-all";
        inputPill.placeholder = "Escribir...";
        
        container.insertBefore(inputPill, addBtn);
        inputPill.focus();
        
        const finalizeInput = () => {
            const val = inputPill.value.trim();
            if (val !== "") {
                const wrapper = document.createElement("div");
                wrapper.className = "relative group";
                
                const newBtn = document.createElement("button");
                newBtn.className = "px-5 py-2 rounded-full border-2 border-blue-600 text-blue-700 bg-blue-50/50 text-xs font-bold shadow-sm transition-all focus:outline-none";
                newBtn.innerText = val;
                newBtn.onclick = function() { toggleSpecialty(this); };
                
                const delBtn = document.createElement("button");
                delBtn.className = "absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full hidden group-hover:flex items-center justify-center shadow-sm border border-white transition-colors focus:outline-none";
                delBtn.innerHTML = '<span class="material-symbols-outlined text-[12px]" translate="no">close</span>';
                delBtn.onclick = function() { wrapper.remove(); };
                
                wrapper.appendChild(newBtn);
                wrapper.appendChild(delBtn);
                container.insertBefore(wrapper, addBtn);
            }
            inputPill.remove();
            addBtn.classList.remove("hidden");
        };
        
        inputPill.addEventListener('blur', finalizeInput);
        inputPill.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputPill.blur(); // Triggers the finalize logic
            }
        });
    }

    // Save logic
    async function saveMember() {
        const nombre = document.getElementById('nombre-cliente').value.trim();
        const email = document.getElementById('email-cliente').value.trim();
        const telRawC = document.getElementById('telefono-cliente').value.trim();
        const pfxC = document.getElementById('country-code-cliente') ? document.getElementById('country-code-cliente').value : '';
        const telefono = telRawC ? (pfxC + ' ' + telRawC).trim() : '';
        const nacimiento = document.getElementById('nacimiento-cliente').value.trim();
        const altura = document.getElementById('altura-cliente').value.trim();
        const peso = document.getElementById('peso-cliente').value.trim();
        let barcode = document.getElementById('barcode-cliente') ? document.getElementById('barcode-cliente').value.trim() : '';
        const estadoFisico = document.getElementById('estado-cliente').value;
        const radios = document.getElementsByName('plan');
        let planLevel = document.getElementById('config-plan1-name') ? document.getElementById('config-plan1-name').value : "TITAN ELITE";
        let planPrice = document.getElementById('config-plan1-price') ? parseFloat(document.getElementById('config-plan1-price').value) : 0;
        let planDuration = document.getElementById('config-plan1-duration') ? document.getElementById('config-plan1-duration').value : "mes";
        
        if (radios[1] && radios[1].checked) { 
            planLevel = document.getElementById('config-plan2-name') ? document.getElementById('config-plan2-name').value : "KINETIC CORE"; 
            planPrice = document.getElementById('config-plan2-price') ? parseFloat(document.getElementById('config-plan2-price').value) : 0;
            planDuration = document.getElementById('config-plan2-duration') ? document.getElementById('config-plan2-duration').value : "mes";
        }
        
        if (!nombre) { showErrorModal("Por favor, ingresa el nombre"); return; }
        
        const avatar = document.getElementById('avatar-circle-cliente').style.backgroundImage;
        let photo = "";
        if (avatar && avatar !== 'none') {
            photo = avatar.slice(4, -1).replace(/"/g, "");
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        let isEditMode = !!urlParams.get('edit');
        let editId = urlParams.get('edit');

        if (!isEditMode && !barcode) {
            barcode = asegurarCodigoBarras('barcode-cliente');
        }

        let newObj;
        
        if (isEditMode) {
            let usrStr = localStorage.getItem('userToEdit');
            let usrBase = usrStr ? JSON.parse(usrStr) : {};
            newObj = {
                ...usrBase,
                name: nombre,
                email: email || "sincorreo@example.com",
                phone: telefono || "",
                dob: nacimiento || "",
                height: altura || "",
                weight: peso || "",
                estadoFisico: estadoFisico !== 'Seleccionar' ? estadoFisico : "",
                plan: planLevel,
                planPrice: planPrice,
                planDuration: planDuration,
                barcode: barcode,
                photo: photo !== "" ? photo : (usrBase.photo || "")
            };
        } else {
            newObj = {
                id: Date.now(),
                name: nombre,
                email: email || "sincorreo@example.com",
                phone: telefono || "",
                dob: nacimiento || "",
                height: altura || "",
                weight: peso || "",
                state: "Active",
                estadoFisico: estadoFisico !== 'Seleccionar' ? estadoFisico : "",
                plan: planLevel,
                planPrice: planPrice,
                planDuration: planDuration,
                barcode: barcode,
                lastVelocity: "Recién ingresado",
                photo: photo,
                role: "Miembro"
            };
        }
        
        try {
            if (isEditMode) {
                await fetch('/api/users/' + encodeURIComponent(editId), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newObj)
                });
            } else {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newObj)
                });
            }
            window.location.href = 'gestion de miembros.html?view=miembros';
        } catch(e) {
            console.error(e);
            showErrorModal("Error al guardar: " + e.message);
        }
    }

    async function saveEntrenador() {
        const nombre = document.getElementById('nombre-entrenador').value.trim();
        const email = document.getElementById('email-entrenador').value.trim();
        const telRawE = document.getElementById('telefono-entrenador').value.trim();
        const pfxE = document.getElementById('country-code-entrenador') ? document.getElementById('country-code-entrenador').value : '';
        const telefono = telRawE ? (pfxE + ' ' + telRawE).trim() : '';
        const nacimiento = document.getElementById('nacimiento-entrenador').value.trim();
        let barcodeEntrenador = document.getElementById('barcode-entrenador') ? document.getElementById('barcode-entrenador').value.trim() : '';

        if (!nombre) { showErrorModal("Por favor, ingresa el nombre del entrenador"); return; }
        
        const avatar = document.getElementById('avatar-circle-entrenador').style.backgroundImage;
        let photo = "";
        if (avatar && avatar !== 'none') {
            photo = avatar.slice(4, -1).replace(/"/g, "");
        }
        
        let disponibilidad = [];
        if (document.getElementById('chk-turno-manana').checked) disponibilidad.push("Turno de Mañana");
        if (document.getElementById('chk-turno-tarde').checked) disponibilidad.push("Turno de Tarde");
        if (document.getElementById('chk-turno-noche').checked) disponibilidad.push("Turno de Noche");

        const urlParams = new URLSearchParams(window.location.search);
        let isEditMode = !!urlParams.get('edit');
        let editId = urlParams.get('edit');

        if (!isEditMode && !barcodeEntrenador) {
            barcodeEntrenador = asegurarCodigoBarras('barcode-entrenador');
        }

        let newObj;

        if (isEditMode) {
            let usrStr = localStorage.getItem('userToEdit');
            let usrBase = usrStr ? JSON.parse(usrStr) : {};
            newObj = {
                ...usrBase,
                name: nombre,
                email: email || "sincorreo@example.com",
                phone: telefono || "",
                dob: nacimiento || "",
                photo: photo !== "" ? photo : (usrBase.photo || ""),
                disponibilidad: disponibilidad,
                role: "Entrenador"
            };
        } else {
            newObj = {
                id: Date.now(),
                name: nombre,
                email: email || "sincorreo@example.com",
                phone: telefono || "",
                dob: nacimiento || "",
                state: "Active",
                plan: "Staff", 
                lastVelocity: "Nuevo Entrenador",
                photo: photo,
                barcode: barcodeEntrenador,
                disponibilidad: disponibilidad,
                role: "Entrenador"
            };
        }
        
        try {
            if (isEditMode) {
                await fetch('/api/users/' + encodeURIComponent(editId), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newObj)
                });
            } else {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newObj)
                });
            }
            window.location.href = 'gestion de miembros.html?view=entrenadores';
        } catch(e) {
            console.error(e);
            alert("Error al guardar entrenador: " + e.message);
        }
    }

    // Image Upload Logic
    function previewImage(input, circleId, placeholderId, delBtnId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const circle = document.getElementById(circleId);
                circle.style.backgroundImage = `url(${e.target.result})`;
                
                document.getElementById(placeholderId).classList.add('hidden');
                const delBtn = document.getElementById(delBtnId);
                delBtn.classList.remove('hidden');
                delBtn.classList.add('flex');
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    function removePhoto(inputId, circleId, placeholderId, delBtnId) {
        document.getElementById(inputId).value = "";
        const circle = document.getElementById(circleId);
        circle.style.backgroundImage = 'none';
        
        document.getElementById(placeholderId).classList.remove('hidden');
        const delBtn = document.getElementById(delBtnId);
        delBtn.classList.add('hidden');
        delBtn.classList.remove('flex');
    }

    // Logic to toggle between Onboarding modes
    function setMode(mode) {
        const btnCliente = document.getElementById('btn-cliente');
        const btnEntrenador = document.getElementById('btn-entrenador');

        const headerCliente = document.getElementById('header-cliente');
        const layoutCliente = document.getElementById('layout-cliente');

        const headerEntrenador = document.getElementById('header-entrenador');
        const layoutEntrenador = document.getElementById('layout-entrenador');

        if (mode === 'cliente') {
            if (btnCliente) btnCliente.className = 'toggle-active py-2 px-8 text-xs';
            if (btnEntrenador) btnEntrenador.className = 'toggle-inactive py-2 px-6 text-xs';

            if (headerCliente) headerCliente.classList.remove('hidden');
            if (layoutCliente) {
                layoutCliente.classList.remove('hidden');
                layoutCliente.classList.add('flex');
            }

            if (headerEntrenador) headerEntrenador.classList.add('hidden');
            if (layoutEntrenador) {
                layoutEntrenador.classList.add('hidden');
                layoutEntrenador.classList.remove('flex');
            }
        } else {
            if (btnEntrenador) btnEntrenador.className = 'toggle-active py-2 px-6 text-xs';
            if (btnCliente) btnCliente.className = 'toggle-inactive py-2 px-8 text-xs';

            if (headerEntrenador) headerEntrenador.classList.remove('hidden');
            if (layoutEntrenador) {
                layoutEntrenador.classList.remove('hidden');
                layoutEntrenador.classList.add('flex');
            }

            if (headerCliente) headerCliente.classList.add('hidden');
            if (layoutCliente) {
                layoutCliente.classList.add('hidden');
                layoutCliente.classList.remove('flex');
            }
        }
    }

    // Cancel Action
    function cancelAction() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('edit')) {
            let usrStr = localStorage.getItem('userToEdit');
            if (usrStr) {
                let usr = JSON.parse(usrStr);
                window.location.href = 'perfil_miembro.html?nombre=' + encodeURIComponent(usr.name);
                return;
            }
        }
        window.location.href = 'gestion de miembros.html';
    }



    // Auto-select mode based on URL parameter or Edition Mode
    window.onload = function() {
        const urlParams = new URLSearchParams(window.location.search);
        let editVal = urlParams.get('edit');

        const splitPhone = (fullPhone, telId, codeId) => {
            if (!fullPhone) return;
            const telInput = document.getElementById(telId);
            const codeSelector = document.getElementById(codeId);
            if (!telInput || !codeSelector) return;
            let matchedCode = '';
            Array.from(codeSelector.options).forEach(opt => {
                const pureOpt = opt.value.trim();
                const purePhone = fullPhone.trim();
                if (pureOpt && purePhone.startsWith(pureOpt) && pureOpt.length > matchedCode.length) {
                    matchedCode = pureOpt;
                }
            });
            if (matchedCode) {
                codeSelector.value = matchedCode;
                telInput.value = fullPhone.trim().substring(matchedCode.length).trim();
            } else {
                telInput.value = fullPhone;
            }
        };
        
        if (editVal) {
            let usrStr = localStorage.getItem('userToEdit');
            if (usrStr) {
                let usr = JSON.parse(usrStr);
                if (usr.role === 'Miembro') {
                    setMode('cliente');
                    document.getElementById('nombre-cliente').value = usr.name || '';
                    document.getElementById('email-cliente').value = usr.email !== 'sincorreo@example.com' ? usr.email : '';
                    splitPhone(usr.phone || usr.telefono || usr.celular || usr.cel, 'telefono-cliente', 'country-code-cliente');
                    document.getElementById('nacimiento-cliente').value = usr.dob || usr.fechaNacimiento || '';
                    document.getElementById('altura-cliente').value = usr.height || '';
                    document.getElementById('peso-cliente').value = usr.weight || '';
                    if (usr.estadoFisico) { document.getElementById('estado-cliente').value = usr.estadoFisico; }
                    
                    if (usr.photo) {
                         document.getElementById('avatar-circle-cliente').style.backgroundImage = `url("${usr.photo}")`;
                         document.getElementById('placeholder-cliente').classList.add('hidden');
                         document.getElementById('del-photo-cliente').classList.remove('hidden');
                         document.getElementById('del-photo-cliente').classList.add('flex');
                    }
                    
                    const radios = document.getElementsByName('plan');
                    if (usr.plan === 'Oro Élite') radios[0].checked = true;
                    if (usr.plan === 'Kinetic Core' || usr.plan === 'Standard') radios[1].checked = true;

                    // Cambiar textos a modo edición
                    document.querySelector('#header-cliente h1').innerHTML = 'Editar <span class="text-blue-700">Miembro</span>';
                    document.querySelector('#header-cliente p').innerText = 'Actualizando datos del perfil del miembro.';
                    document.querySelector('button[onclick="saveMember()"]').innerText = 'GUARDAR CAMBIOS';
                } else {
                    setMode('entrenador');
                    document.getElementById('nombre-entrenador').value = usr.name || '';
                    document.getElementById('email-entrenador').value = usr.email !== 'sincorreo@example.com' ? usr.email : '';
                    splitPhone(usr.phone || usr.telefono || usr.celular || usr.cel, 'telefono-entrenador', 'country-code-entrenador');
                    document.getElementById('nacimiento-entrenador').value = usr.dob || usr.fechaNacimiento || '';

                    if (usr.photo) {
                         document.getElementById('avatar-circle-entrenador').style.backgroundImage = `url("${usr.photo}")`;
                         document.getElementById('placeholder-entrenador').classList.add('hidden');
                         document.getElementById('del-photo-entrenador').classList.remove('hidden');
                         document.getElementById('del-photo-entrenador').classList.add('flex');
                    }
                    
                    if (usr.disponibilidad && Array.isArray(usr.disponibilidad)) {
                         if (usr.disponibilidad.includes("Turno de Mañana")) document.getElementById('chk-turno-manana').checked = true;
                         if (usr.disponibilidad.includes("Turno de Tarde")) document.getElementById('chk-turno-tarde').checked = true;
                         if (usr.disponibilidad.includes("Turno de Noche")) document.getElementById('chk-turno-noche').checked = true;
                    }
                    
                    const entrenadorTitle = document.querySelector('#header-entrenador h1');
                    if (entrenadorTitle) {
                        entrenadorTitle.innerHTML = 'Editar <span class="text-blue-700">Entrenador</span>';
                    }
                    const entrenadorSaveBtn = document.querySelector('button[onclick="saveEntrenador()"]');
                    if (entrenadorSaveBtn) {
                        entrenadorSaveBtn.innerText = 'GUARDAR CAMBIOS';
                    }
                }
            }
        } else {
            if (urlParams.get('type') === 'entrenador') {
                setMode('entrenador');
            } else if (urlParams.get('type') === 'cliente') {
                setMode('cliente');
            }
        }
    };
