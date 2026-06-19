
  async function cargarBaseDeDatos() {
      try {
          const resUsers = await fetch('/api/users');
          const users = await resUsers.json();
          
          const resClasses = await fetch('/api/classes');
          const classes = await resClasses.json();

          // Filtro del mes actual
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
          
          let headerEl = document.getElementById('header_mes_actual');
          if(headerEl) {
              headerEl.innerText = \`Cierre Mensual - \${meses[currentMonth]} \${currentYear}\`;
          }

          // 1. Membresias (solo pagos reales emitidos este mismo mes)
          let membresias = 0;
          let miembrosVigentes = 0;
          
          users.forEach(u => {
              if(u.role === 'Miembro') {
                  miembrosVigentes++;
                  let hasAddedPayments = false;
                  let pagosList = u.payments || u.pagos || [];
                  if(pagosList.length > 0) {
                      pagosList.forEach(p => {
                          let pDateStr = p.fecha || p.date || p.timestamp;
                          if (pDateStr) {
                              let d = new Date(pDateStr);
                              if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                                  if (p.status === 'ÉXITO' || p.estado === 'Pagado' || p.status === 'PAGADO' || p.status === 'Pagado') {
                                      membresias += parseFloat(p.amount || p.monto || p.total || 0);
                                      hasAddedPayments = true;
                                  }
                              }
                          }
                      });
                  }
                  
                  if (!hasAddedPayments && u.id) {
                      const dateObj = new Date(parseInt(u.id));
                      if (!isNaN(dateObj.getTime())) {
                          if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear && u.planPrice) {
                              membresias += parseFloat(u.planPrice);
                          }
                      }
                  }
              }
          });

          // 2. Nomina Staff (leyendo estrictamente del REGISTRO DE PAGOS (u.pagos), no cálculos teóricos)
          let nominaStaff = 0;
          users.forEach(u => {
              if(u.role === 'Entrenador' || u.role === 'Staff' || u.role === 'trainer' || u.role === 'Empleados') {
                  if (u.pagos && u.pagos.length > 0) {
                      u.pagos.forEach(p => {
                          let pDateStr = p.fecha || p.date;
                          if (pDateStr) {
                              let d = new Date(pDateStr);
                              if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                                  if (p.estado === 'Pagado' || p.estado === 'PAGADO') {
                                      nominaStaff += parseFloat(p.monto || 0);
                                  }
                              }
                          }
                      });
                  }
              }
          });

          // 3. Ventas POS (leyendo del historial de POS del mes)
          let ventasPos = 0;
          try {
              const posHist = JSON.parse(localStorage.getItem('historialPOS') || '[]');
              const transVentas = JSON.parse(localStorage.getItem('transaccionesVentas') || '[]');
              const allPOS = [...posHist, ...transVentas];
              allPOS.forEach(v => {
                  if(!v.fecha) return;
                  let dObj = new Date(v.fecha);
                  if(!isNaN(dObj.getTime())) {
                      if (dObj.getMonth() === currentMonth && dObj.getFullYear() === currentYear) {
                          ventasPos += parseFloat(v.monto || v.total || v.amount || 0);
                      }
                  }
              });
          } catch(e) { console.error(e); }

          let mantenimientos = 0;
          let renta = 0;
          let serviciosExtra = 0;

          // Calculos Finales
          let ingresosTotales = membresias + ventasPos + serviciosExtra;
          let egresosTotales = nominaStaff + mantenimientos + renta;
          let utilidad = ingresosTotales - egresosTotales;
          let margen = ingresosTotales > 0 ? ((utilidad / ingresosTotales) * 100).toFixed(1) : 0;

          // Store globally for saving
          window._cierresData = {
              ingresosTotales,
              egresosTotales,
              utilidad,
              margen
          };

          // Actualizar UI
          document.getElementById('c_ingresos_totales').innerText = '$' + ingresosTotales.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_membresias').innerText = '$' + membresias.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_ventas_pos').innerText = '$' + ventasPos.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_servicios_extra').innerText = '$' + serviciosExtra.toLocaleString('en-US', {minimumFractionDigits: 2});
          
          document.getElementById('c_nomina_staff').innerText = '-$' + nominaStaff.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_mantenimiento').innerText = '-$' + mantenimientos.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_servicios_renta').innerText = '-$' + renta.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_total_egresos').innerText = '-$' + egresosTotales.toLocaleString('en-US', {minimumFractionDigits: 2});

          document.getElementById('c_utilidad_neta').innerText = '$' + utilidad.toLocaleString('en-US', {minimumFractionDigits: 2});
          document.getElementById('c_margen').innerHTML = 'Margen operativo del<br/>' + margen + '%';

          document.getElementById('c_nuevos_miembros').innerText = miembrosVigentes;
          document.getElementById('c_tasa_retencion').innerText = '100%';
          

          document.getElementById('c_observaciones').value = "";

      } catch(e) {
          document.getElementById('c_observaciones').value = "Error cargando la base de datos.";
          console.error(e);
      }
  }

  document.addEventListener("DOMContentLoaded", cargarBaseDeDatos);

  function ejecutarCierreYRedirigir() {
      // 1. Get current data from our global state
      const data = window._cierresData;
      if(!data) {
          alert('Datos no listos aún. Espere un momento.');
          return;
      }

      // 2. Format a new closure object
      let dateObj = new Date();
      let mesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      let mesName = mesNombres[dateObj.getMonth()];
      let mesAbrev = mesName.substring(0, 3).toUpperCase();
      let year = dateObj.getFullYear();
      
      let nuevoCierre = {
          id: Date.now(),
          mesAbv: mesAbrev,
          mesFull: mesName,
          ano: year,
          ingresos: data.ingresosTotales,
          egresos: data.egresosTotales,
          utilidad: data.utilidad,
          margen: data.margen,
          responsable: 'Admin', // default
          estado: 'Completado'
      };

      // 3. Save to localStorage using the correct key
      let closures = JSON.parse(localStorage.getItem('historialCierresMes') || '[]');
      
      // Prevent duplicates: remove if one for the same month/year already exists
      closures = closures.filter(c => !(c.mesFull === nuevoCierre.mesFull && c.ano === nuevoCierre.ano));
      
      closures.unshift(nuevoCierre);
      localStorage.setItem('historialCierresMes', JSON.stringify(closures));

      // 4. Redirect
      window.location.href = 'historial_mes.html';
  }
