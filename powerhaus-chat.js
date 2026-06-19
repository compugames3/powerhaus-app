(function () {
  'use strict';

  const EXCLUDED_PAGES = ['index.html', 'calendario.html'];
  const STORAGE_KEY = 'powerhaus_smartbot_history_v1';
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  if (EXCLUDED_PAGES.includes(currentPage)) return;
  if (document.getElementById('ph-smartbot-root')) return;

  const pageConfig = {
    'administrador.html': {
      title: 'Panel principal',
      description: 'Puedo ayudarte con métricas, ingresos y accesos rápidos del panel.',
      suggestions: ['Resumen del panel', 'Ir a miembros', 'Ir a cierre']
    },
    'gestion de miembros.html': {
      title: 'Gestión de miembros',
      description: 'Te ayudo a ir rápido a altas, edición o historial de miembros.',
      suggestions: ['Nuevo miembro', 'Ver historial', 'Buscar entrenadores']
    },
    'punto de venta.html': {
      title: 'Punto de venta',
      description: 'Puedo orientarte para ventas, carrito y cierre del día.',
      suggestions: ['Abrir carrito', 'Ver historial de ventas', 'Ir a cierre']
    },
    'cierre.html': {
      title: 'Cierre del día',
      description: 'Te apoyo con cierre diario, historial y revisión de ingresos.',
      suggestions: ['Ver historial de cierres', 'Ir al panel', 'Ir a ventas']
    },
    'soporte.html': {
      title: 'Soporte',
      description: 'Puedo responder preguntas frecuentes y llevarte a secciones clave.',
      suggestions: ['Abrir ajustes', 'Ver temas', 'Ir al panel']
    }
  };

  const quickRoutes = [
    { label: 'Panel principal', href: 'administrador.html', match: ['panel', 'inicio', 'dashboard', 'principal'] },
    { label: 'Miembros', href: 'gestion de miembros.html', match: ['miembro', 'miembros', 'entrenador', 'entrenadores', 'usuarios'] },
    { label: 'Nueva clase', href: 'nueva_clase.html', match: ['nueva clase', 'crear clase', 'clase nueva'] },
    { label: 'Clases', href: 'calendario.html', match: ['clase', 'clases', 'calendario'] },
    { label: 'Punto de venta', href: 'punto de venta.html', match: ['venta', 'ventas', 'cobro', 'pos', 'punto de venta'] },
    { label: 'Carrito', href: 'carrito.html', match: ['carrito', 'ticket'] },
    { label: 'Cierre', href: 'cierre.html', match: ['cierre', 'corte', 'arqueo'] },
    { label: 'Historial de ventas', href: 'historial_ventas.html', match: ['historial de ventas', 'ventas anteriores'] },
    { label: 'Historial', href: 'historial.html', match: ['historial', 'movimientos'] },
    { label: 'Ajustes', href: 'ajustes.html', match: ['ajustes', 'configuración', 'configuracion', 'preferencias'] },
    { label: 'Temas', href: 'temas.html', match: ['tema', 'temas', 'apariencia'] },
    { label: 'Soporte', href: 'soporte.html', match: ['soporte', 'ayuda', 'asistencia'] },
    { label: 'Terminal de acceso', href: 'terminal_asistencia.html', match: ['terminal', 'acceso', 'entrada'] },
    { label: 'Terminal de salida', href: 'terminal_salida.html', match: ['salida', 'check out'] }
  ];

  const dbTitle = localStorage.getItem('powerhaus_brand_title') || 'PowerHaus';
  const currentConfig = pageConfig[currentPage] || {
    title: `Asistente ${dbTitle}`,
    description: 'Puedo darte atajos, ayuda rápida y contexto de la página actual.',
    suggestions: ['¿Qué puedes hacer?', 'Ir al panel', 'Abrir soporte']
  };

  const style = document.createElement('style');
  style.id = 'ph-smartbot-style';
  style.textContent = `
    #ph-smartbot-root {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 9999;
      font-family: Inter, system-ui, sans-serif;
    }
    #ph-smartbot-toggle {
      width: 62px;
      height: 62px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #60a5fa 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 16px 40px rgba(37, 99, 235, 0.35);
      transition: transform .2s ease, box-shadow .2s ease;
    }
    #ph-smartbot-toggle:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 20px 44px rgba(37, 99, 235, 0.42);
    }
    #ph-smartbot-toggle .material-symbols-outlined {
      font-size: 30px;
    }
    #ph-smartbot-panel {
      width: min(380px, calc(100vw - 24px));
      height: min(600px, calc(100vh - 110px));
      position: absolute;
      right: 0;
      bottom: 78px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-radius: 28px;
      background: rgba(255,255,255,.92);
      border: 1px solid rgba(148,163,184,.18);
      box-shadow: 0 24px 70px rgba(15,23,42,.18);
      backdrop-filter: blur(18px);
      opacity: 0;
      pointer-events: none;
      transform: translateY(18px) scale(.96);
      transition: opacity .22s ease, transform .22s ease;
    }
    #ph-smartbot-panel.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .ph-smartbot-head {
      padding: 18px 18px 14px;
      background: linear-gradient(135deg, #020617 0%, #1d4ed8 60%, #38bdf8 100%);
      color: #fff;
    }
    .ph-smartbot-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.14);
      margin-bottom: 12px;
    }
    .ph-smartbot-topline {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }
    .ph-smartbot-title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      line-height: 1.1;
    }
    .ph-smartbot-subtitle {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.55;
      color: rgba(255,255,255,.82);
    }
    .ph-smartbot-head-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .ph-smartbot-icon-btn {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      color: #fff;
      background: rgba(255,255,255,.12);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .ph-smartbot-body {
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: 1;
      background:
        radial-gradient(circle at top right, rgba(96,165,250,.14), transparent 30%),
        linear-gradient(180deg, #eff6ff 0%, #ffffff 45%);
    }
    .ph-smartbot-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ph-smartbot-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .ph-smartbot-scroll::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,.5);
      border-radius: 999px;
    }
    .ph-smartbot-welcome {
      padding: 16px;
      border-radius: 22px;
      background: rgba(255,255,255,.95);
      border: 1px solid rgba(191,219,254,.9);
      box-shadow: 0 12px 28px rgba(37,99,235,.08);
      color: #0f172a;
    }
    .ph-smartbot-welcome h4 {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 800;
    }
    .ph-smartbot-welcome p {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }
    .ph-smartbot-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .ph-smartbot-chip {
      border: none;
      border-radius: 999px;
      padding: 9px 12px;
      cursor: pointer;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
    }
    .ph-smartbot-msg {
      display: flex;
    }
    .ph-smartbot-msg.user {
      justify-content: flex-end;
    }
    .ph-smartbot-bubble {
      max-width: 86%;
      padding: 12px 14px;
      border-radius: 18px;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-line;
      word-break: break-word;
    }
    .ph-smartbot-msg.bot .ph-smartbot-bubble {
      background: #fff;
      color: #0f172a;
      border: 1px solid #dbeafe;
      border-bottom-left-radius: 6px;
      box-shadow: 0 8px 22px rgba(37,99,235,.08);
    }
    .ph-smartbot-msg.user .ph-smartbot-bubble {
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      color: #fff;
      border-bottom-right-radius: 6px;
      box-shadow: 0 10px 24px rgba(37,99,235,.22);
    }
    .ph-smartbot-footer {
      padding: 14px 16px 16px;
      border-top: 1px solid rgba(226,232,240,.9);
      background: rgba(255,255,255,.92);
    }
    .ph-smartbot-input-wrap {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      padding: 8px;
      border-radius: 20px;
      background: #f8fafc;
      border: 1px solid #dbeafe;
    }
    #ph-smartbot-input {
      width: 100%;
      resize: none;
      border: none;
      outline: none;
      background: transparent;
      min-height: 24px;
      max-height: 96px;
      font: inherit;
      font-size: 13px;
      line-height: 1.5;
      color: #0f172a;
      padding: 6px 8px;
    }
    #ph-smartbot-send {
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(135deg, #0f172a, #2563eb);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ph-smartbot-tip {
      margin-top: 8px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
    .ph-smartbot-links {
      display: grid;
      gap: 8px;
      margin-top: 10px;
    }
    .ph-smartbot-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 14px;
      text-decoration: none;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
    }
    @media (max-width: 640px) {
      #ph-smartbot-root {
        right: 12px;
        bottom: 12px;
      }
      #ph-smartbot-panel {
        width: calc(100vw - 24px);
        height: min(70vh, 560px);
        bottom: 74px;
      }
      #ph-smartbot-toggle {
        width: 58px;
        height: 58px;
        border-radius: 18px;
      }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = 'ph-smartbot-root';
  root.innerHTML = `
    <div id="ph-smartbot-panel" aria-label="Asistente ${dbTitle}" role="dialog">
      <div class="ph-smartbot-head">
        <div class="ph-smartbot-badge">
          <span class="material-symbols-outlined notranslate" translate="no" style="font-size:16px">bolt</span>
          SmartBot
        </div>
        <div class="ph-smartbot-topline">
          <div>
            <h3 class="ph-smartbot-title">${currentConfig.title}</h3>
            <p class="ph-smartbot-subtitle">${currentConfig.description}</p>
          </div>
          <div class="ph-smartbot-head-actions">
            <button id="ph-smartbot-reset" class="ph-smartbot-icon-btn" type="button" title="Reiniciar">
              <span class="material-symbols-outlined notranslate" translate="no" style="font-size:18px">refresh</span>
            </button>
            <button id="ph-smartbot-close" class="ph-smartbot-icon-btn" type="button" title="Cerrar">
              <span class="material-symbols-outlined notranslate" translate="no" style="font-size:18px">close</span>
            </button>
          </div>
        </div>
      </div>
      <div class="ph-smartbot-body">
        <div id="ph-smartbot-scroll" class="ph-smartbot-scroll">
          <div class="ph-smartbot-welcome" id="ph-smartbot-welcome">
            <h4>Nuevo chat listo</h4>
            <p>Estoy disponible en casi todo el sistema para darte ayuda rápida, atajos y respuestas sobre la página actual.</p>
            <div class="ph-smartbot-chips" id="ph-smartbot-suggestions"></div>
          </div>
        </div>
        <div class="ph-smartbot-footer">
          <div class="ph-smartbot-input-wrap">
            <textarea id="ph-smartbot-input" rows="1" placeholder="Escribe una pregunta o pide abrir una sección..."></textarea>
            <button id="ph-smartbot-send" type="button" title="Enviar">
              <span class="material-symbols-outlined notranslate" translate="no" style="font-size:20px">send</span>
            </button>
          </div>
          <div class="ph-smartbot-tip">Ejemplo: “llévame a miembros” o “qué puedes hacer aquí”.</div>
        </div>
      </div>
    </div>
    <button id="ph-smartbot-toggle" type="button" aria-label="Abrir SmartBot" title="Abrir SmartBot">
      <span class="material-symbols-outlined notranslate" translate="no">forum</span>
    </button>
  `;
  document.body.appendChild(root);

  const panel = document.getElementById('ph-smartbot-panel');
  const toggle = document.getElementById('ph-smartbot-toggle');
  const closeBtn = document.getElementById('ph-smartbot-close');
  const resetBtn = document.getElementById('ph-smartbot-reset');
  const scroll = document.getElementById('ph-smartbot-scroll');
  const input = document.getElementById('ph-smartbot-input');
  const send = document.getElementById('ph-smartbot-send');
  const welcome = document.getElementById('ph-smartbot-welcome');
  const suggestionsWrap = document.getElementById('ph-smartbot-suggestions');

  let isOpen = false;
  let history = [];

  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  }

  function scrollToBottom() {
    scroll.scrollTop = scroll.scrollHeight;
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
    } catch (_) {}
  }

  function openBot() {
    isOpen = true;
    panel.classList.add('visible');
    setTimeout(() => input.focus(), 120);
  }

  function closeBot() {
    isOpen = false;
    panel.classList.remove('visible');
  }

  function addMessage(role, text) {
    if (welcome && welcome.parentNode) {
      welcome.remove();
    }
    const row = document.createElement('div');
    row.className = 'ph-smartbot-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'ph-smartbot-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    scroll.appendChild(row);
    scrollToBottom();
  }

  function addLinks(links) {
    if (!links || !links.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'ph-smartbot-links';
    wrap.innerHTML = links.map(link => `
      <a class="ph-smartbot-link" href="${link.href}">
        <span>${link.label}</span>
        <span class="material-symbols-outlined notranslate" translate="no" style="font-size:18px">arrow_forward</span>
      </a>
    `).join('');
    scroll.appendChild(wrap);
    scrollToBottom();
  }

  async function getSystemSnapshot() {
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
        text: 'Puedo ayudarte con varias cosas:\n• Darte datos de asistencia y personal (admins/entrenadores).\n• Consultar tu inventario y alertas de stock.\n• Mostrar los ingresos del día o del mes.\n• Darte atajos directos a otras secciones.',
        links: [
          { label: 'Ir al panel principal', href: 'administrador.html' },
          { label: 'Abrir soporte', href: 'soporte.html' }
        ]
      };
    }

    if (query.includes('empleado') || query.includes('admin') || query.includes('staff') || query.includes('entrenador')) {
      return {
        text: `Aquí tienes el desglose del personal registrado en la base de datos:\n• Administradores: ${snapshot.admins}\n• Entrenadores/Staff: ${snapshot.trainers}\n• Total de empleados: ${snapshot.employees}`,
        links: [
          { label: 'Gestionar Personal', href: 'gestion de miembros.html?view=entrenadores' },
          { label: 'Ver Panel Principal', href: 'administrador.html' }
        ]
      }
    }

    if (query.includes('producto') || query.includes('inventario') || query.includes('stock')) {
      let responseText = `Actualmente hay ${snapshot.productsCount} producto(s) registrados en tu inventario.\n`;
      if (snapshot.productsCount > 0) {
          responseText += `\nProductos disponibles: ${snapshot.allProductsInfo}\n`;
      }
      if (snapshot.lowStockProducts.length > 0) {
          responseText += `\n⚠️ Alerta: Tienes ${snapshot.lowStockProducts.length} producto(s) con stock crítico:\n- ` + snapshot.lowStockProducts.join('\n- ');
      } else if (snapshot.productsCount > 0) {
          responseText += `\n✅ Tu stock está saludable, ningún producto está por agotarse.`;
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
        text: `Hoy se ha registrado la entrada de ${snapshot.attendanceToday} persona(s) al establecimiento.\n\n(Dato basado en el último registro de "Check-In" de cada miembro en la base de datos).`,
        links: [
          { label: 'Abrir Terminal de Acceso', href: 'terminal_asistencia.html' },
          { label: 'Ir al Panel', href: 'administrador.html' }
        ]
      };
    }

    if (query.includes('monto') || query.includes('dinero') || query.includes('recaudado') || query.includes('ingreso') || query.includes('venta') || query.includes('cobro') || query.includes('ingresos') || query.includes('ganancia')) {
      return {
        text: `Resumen financiero:\n• Hoy se ha recaudado: $${snapshot.salesToday.toFixed(2)}\n• Total de este mes: $${snapshot.salesMonth.toFixed(2)}\n\n(Incluye ventas por punto de venta, membresías e inscripciones).`,
        links: [
          { label: 'Abrir Punto de Venta', href: 'punto de venta.html' },
          { label: 'Ver Historial de Ventas', href: 'historial_ventas.html' },
          { label: 'Hacer Cierre de Día', href: 'cierre.html' }
        ]
      };
    }

    if (query.includes('resumen') || query.includes('panel')) {
      return {
        text: `Resumen rápido de hoy:\n• Miembros: ${snapshot.members}\n• Entrenadores: ${snapshot.trainers}\n• Clases: ${snapshot.classes}\n• Asistencias hoy: ${snapshot.attendanceToday}\n• Ventas hoy: $${snapshot.salesToday.toFixed(2)}`,
        links: [
          { label: 'Ver panel principal', href: 'administrador.html' }
        ]
      };
    }

    if (query.includes('miembro')) {
      return {
        text: `Actualmente tienes ${snapshot.members} miembros registrados en la base de datos.\nAdemás cuentas con ${snapshot.employees} empleado(s) de staff en total.\n\nEl día de hoy han asistido ${snapshot.attendanceToday} miembro(s).`,
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
      text: `Estoy activo en ${currentConfig.title}. Puedes preguntarme cosas como:\n• "¿Cuántos miembros hay?"\n• "¿Cuál es el inventario de productos?"\n• "¿Cuál es el monto recaudado hoy?"\n• "¿Cuántos asistieron hoy?"\n• "Ir al panel"`,
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
