import os

filepath = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\powerhaus-chat.js"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_content = """  async function getSystemSnapshot() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const snapshot = {
      page: currentPage,
      members: 0,
      trainers: 0,
      admins: 0,
      employees: 0,
      attendanceToday: 0,
      classes: 0,
      salesToday: 0,
      salesMonth: 0,
      productsCount: 0,
      lowStockProducts: [],
      allProductsInfo: ''
    };

    try {
      const usersRes = await fetch('/api/users?t=' + Date.now(), { cache: 'no-store' });
      if (usersRes.ok) {
        const users = await usersRes.json();
        users.forEach(u => {
          const role = String(u.role || '').toLowerCase();
          const name = String(u.name || '').toLowerCase();
          if (role.includes('admin') || name === 'admin') {
              snapshot.admins++;
              snapshot.employees++;
          } else if (role.includes('entrenador') || role.includes('trainer') || role.includes('staff')) {
              snapshot.trainers++;
              snapshot.employees++;
          } else {
              snapshot.members++;
          }
          if (u.lastCheckIn) {
              const checkInDate = new Date(u.lastCheckIn);
              if (!isNaN(checkInDate.getTime())) {
                  const checkInStr = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`;
                  if (checkInStr === todayStr) {
                      snapshot.attendanceToday++;
                  }
              }
          }
        });
      }
    } catch (_) {}

    try {
      const classesRes = await fetch('/api/classes?t=' + Date.now(), { cache: 'no-store' });
      if (classesRes.ok) {
        const classes = await classesRes.json();
        snapshot.classes = Array.isArray(classes) ? classes.length : 0;
      }
    } catch (_) {}

    try {
      const pos = JSON.parse(localStorage.getItem('historialPOS') || '[]');
      const sales = JSON.parse(localStorage.getItem('transaccionesVentas') || '[]');
      const allSales = [...pos, ...sales];
      let sumToday = 0;
      let sumMonth = 0;
      allSales.forEach(s => {
         if (!s.fecha) return;
         let dObj = new Date(s.fecha);
         if(isNaN(dObj.getTime())) return;
         let cDateLocal = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
         const amt = parseFloat(s.total || s.monto || s.amount || 0);
         if(cDateLocal === todayStr) sumToday += amt;
         if(cDateLocal.startsWith(monthStr)) sumMonth += amt;
      });
      snapshot.salesToday = sumToday;
      snapshot.salesMonth = sumMonth;
    } catch (_) {}

    try {
        const prods = JSON.parse(localStorage.getItem('inventarioProductos') || '[]');
        snapshot.productsCount = prods.length;
        let lowStock = [];
        let prodNames = [];
        prods.forEach(p => {
            const stock = parseInt(p.stock || 0);
            if (stock <= 3) lowStock.push(`${p.nombre} (quedan ${stock})`);
            prodNames.push(p.nombre);
        });
        snapshot.lowStockProducts = lowStock;
        if (prodNames.length > 0) {
            snapshot.allProductsInfo = prodNames.length > 5 ? prodNames.slice(0, 5).join(', ') + `... y ${prodNames.length - 5} más.` : prodNames.join(', ');
        }
    } catch(_) {}

    return snapshot;
  }

  function detectRoute(text) {
    const query = text.toLowerCase();
    return quickRoutes.find(route => route.match.some(term => query.includes(term)));
  }

  async function buildReply(text) {
    const query = text.toLowerCase().trim();
    const route = detectRoute(query);
    const snapshot = await getSystemSnapshot();

    if (route && /ir|abre|abrir|ll[eé]vame|llevar|mostrar|ver/.test(query)) {
      return {
        text: `Claro. Te dejo el acceso directo a ${route.label}.`,
        links: [{ label: `Abrir ${route.label}`, href: route.href }]
      };
    }

    if (query.includes('qué puedes hacer') || query.includes('que puedes hacer') || query.includes('ayuda')) {
      return {
        text: 'Puedo ayudarte con varias cosas:\\n• Darte datos de asistencia y personal (admins/entrenadores).\\n• Consultar tu inventario y alertas de stock.\\n• Mostrar los ingresos del día o del mes.\\n• Darte atajos directos a otras secciones.',
        links: [
          { label: 'Ir al panel principal', href: 'administrador.html' },
          { label: 'Abrir soporte', href: 'soporte.html' }
        ]
      };
    }

    if (query.includes('empleado') || query.includes('admin') || query.includes('staff') || query.includes('entrenador')) {
      return {
        text: `Aquí tienes el desglose del personal registrado en la base de datos:\\n• Administradores: ${snapshot.admins}\\n• Entrenadores/Staff: ${snapshot.trainers}\\n• Total de empleados: ${snapshot.employees}`,
        links: [
          { label: 'Gestionar Personal', href: 'gestion de miembros.html?view=entrenadores' },
          { label: 'Ver Panel Principal', href: 'administrador.html' }
        ]
      }
    }

    if (query.includes('producto') || query.includes('inventario') || query.includes('stock')) {
      let responseText = `Actualmente hay ${snapshot.productsCount} producto(s) registrados en tu inventario.\\n`;
      if (snapshot.productsCount > 0) {
          responseText += `\\nProductos disponibles: ${snapshot.allProductsInfo}\\n`;
      }
      if (snapshot.lowStockProducts.length > 0) {
          responseText += `\\n⚠️ Alerta: Tienes ${snapshot.lowStockProducts.length} producto(s) con stock crítico:\\n- ` + snapshot.lowStockProducts.join('\\n- ');
      } else if (snapshot.productsCount > 0) {
          responseText += `\\n✅ Tu stock está saludable, ningún producto está por agotarse.`;
      }
      return {
        text: responseText,
        links: [
          { label: 'Ir al Punto de Venta', href: 'punto de venta.html' }
        ]
      };
    }

    if (query.includes('asist') || query.includes('entraron') || query.includes('check')) {
      return {
        text: `Hoy se ha registrado la entrada de ${snapshot.attendanceToday} persona(s) al establecimiento.\\n\\n(Dato basado en el último registro de "Check-In" de cada miembro en la base de datos).`,
        links: [
          { label: 'Abrir Terminal de Acceso', href: 'terminal_asistencia.html' },
          { label: 'Ir al Panel', href: 'administrador.html' }
        ]
      };
    }

    if (query.includes('monto') || query.includes('dinero') || query.includes('recaudado') || query.includes('ingreso') || query.includes('venta') || query.includes('cobro') || query.includes('ingresos') || query.includes('ganancia')) {
      return {
        text: `Resumen financiero:\\n• Hoy se ha recaudado: $${snapshot.salesToday.toFixed(2)}\\n• Total de este mes: $${snapshot.salesMonth.toFixed(2)}\\n\\n(Incluye ventas por punto de venta, membresías e inscripciones).`,
        links: [
          { label: 'Abrir Punto de Venta', href: 'punto de venta.html' },
          { label: 'Ver Historial de Ventas', href: 'historial_ventas.html' },
          { label: 'Hacer Cierre de Día', href: 'cierre.html' }
        ]
      };
    }

    if (query.includes('resumen') || query.includes('panel')) {
      return {
        text: `Resumen rápido de hoy:\\n• Miembros: ${snapshot.members}\\n• Entrenadores: ${snapshot.trainers}\\n• Clases: ${snapshot.classes}\\n• Asistencias hoy: ${snapshot.attendanceToday}\\n• Ventas hoy: $${snapshot.salesToday.toFixed(2)}`,
        links: [
          { label: 'Ver panel principal', href: 'administrador.html' }
        ]
      };
    }

    if (query.includes('miembro')) {
      return {
        text: `Actualmente tienes ${snapshot.members} miembros registrados en la base de datos.\\nAdemás cuentas con ${snapshot.employees} empleado(s) de staff en total.\\n\\nEl día de hoy han asistido ${snapshot.attendanceToday} miembro(s).`,
        links: [
          { label: 'Gestionar miembros', href: 'gestion de miembros.html' },
          { label: 'Crear nuevo miembro', href: 'nuevo_miembro.html' }
        ]
      };
    }

    if (query.includes('clase')) {
      return {
        text: `Hay ${snapshot.classes} clases registradas en este momento. Si necesitas organizar horarios, puedo llevarte allí.`,
        links: [
          { label: 'Crear nueva clase', href: 'nueva_clase.html' },
          { label: 'Ir a clases (Calendario)', href: 'calendario.html' }
        ]
      };
    }

    if (route) {
      return {
        text: `Encontré una coincidencia con ${route.label}. Usa el siguiente botón para ir rápido.` ,
        links: [{ label: `Abrir ${route.label}`, href: route.href }]
      };
    }

    return {
      text: `Estoy activo en ${currentConfig.title}. Puedes preguntarme cosas como:\\n• "¿Cuántos miembros hay?"\\n• "¿Cuál es el inventario de productos?"\\n• "¿Cuál es el monto recaudado hoy?"\\n• "¿Cuántos asistieron hoy?"\\n• "Ir al panel"`,
      links: []
    };
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    addMessage('user', text);
    history.push({ role: 'user', text });
    saveHistory();

    send.disabled = true;
    input.value = '';
    autoResize();

    const typing = document.createElement('div');
    typing.className = 'ph-smartbot-msg bot';
    typing.id = 'ph-smartbot-typing';
    typing.innerHTML = '<div class="ph-smartbot-bubble">Escribiendo respuesta...</div>';
    scroll.appendChild(typing);
    scrollToBottom();

    try {
      const reply = await buildReply(text);
      typing.remove();
      addMessage('bot', reply.text);
      addLinks(reply.links);
      history.push({ role: 'bot', text: reply.text, links: reply.links || [] });
      saveHistory();
    } catch (_) {
      typing.remove();
      addMessage('bot', 'No pude preparar la respuesta en este momento, pero sigo disponible para darte accesos directos.');
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  function restoreHistory() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(saved) || !saved.length) return;
      history = saved;
      if (welcome && welcome.parentNode) {
        welcome.remove();
      }
      history.forEach(item => {
        addMessage(item.role === 'user' ? 'user' : 'bot', item.text);
        if (item.role !== 'user' && item.links && item.links.length) {
          addLinks(item.links);
        }
      });
    } catch (_) {}
  }

  function renderSuggestions() {
    const suggestions = currentConfig.suggestions || [];
    suggestionsWrap.innerHTML = suggestions.map(label => `<button class="ph-smartbot-chip" type="button">${label}</button>`).join('');
    suggestionsWrap.querySelectorAll('.ph-smartbot-chip').forEach(button => {
      button.addEventListener('click', () => {
        openBot();
        sendMessage(button.textContent || '');
      });
    });
  }

  toggle.addEventListener('click', () => {
    if (isOpen) closeBot();
    else openBot();
  });
  closeBtn.addEventListener('click', closeBot);
  resetBtn.addEventListener('click', () => {
    history = [];
    sessionStorage.removeItem(STORAGE_KEY);
    scroll.innerHTML = '';
    scroll.appendChild(welcome);
    renderSuggestions();
    addMessage('bot', 'Chat reiniciado. Puedo seguir ayudándote desde esta página.');
  });
  send.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('input', autoResize);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input.value);
    }
  });
  document.addEventListener('click', (event) => {
    if (!isOpen) return;
    if (!panel.contains(event.target) && !toggle.contains(event.target)) {
      closeBot();
    }
  });

  renderSuggestions();
  restoreHistory();
})();
"""

# Replace lines 458 to 954 (0-indexed lines[458:955])
new_lines = lines[:458] + [new_content]

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Updated successfully")
