import os

# Update cierre.html
cierre_path = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\cierre.html"
with open(cierre_path, "r", encoding="utf-8") as f:
    cierre_content = f.read()

target_cierre = """  // Protección de sesión
  if (!localStorage.getItem('usuario_activo')) {
    window.location.href = 'index.html';
  }"""

new_cierre = """  // Protección de sesión y permisos
  const userActivoJson = localStorage.getItem('usuario_activo');
  if (!userActivoJson) {
    window.location.href = 'index.html';
  } else {
    try {
      const activeUser = JSON.parse(userActivoJson);
      const isAdmin = activeUser.rol === 'Admin';
      const hasPerm = activeUser.perms && activeUser.perms.includes('Cierre de Día');
      if (!isAdmin && !hasPerm) {
         alert('Acceso Denegado: No tienes el permiso "Cierre de Día".');
         window.location.href = 'administrador.html';
      }
    } catch(e){}
  }"""

if target_cierre in cierre_content:
    cierre_content = cierre_content.replace(target_cierre, new_cierre)
    with open(cierre_path, "w", encoding="utf-8") as f:
        f.write(cierre_content)
    print("cierre.html updated")


# Update cierre_mes.html
cierre_mes_path = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\cierre_mes.html"
with open(cierre_mes_path, "r", encoding="utf-8") as f:
    cierre_mes_content = f.read()

target_cierre_mes = """<script>
  async function cargarBaseDeDatos() {"""

new_cierre_mes = """<script>
  // Protección de sesión y permisos
  const userActivoJson = localStorage.getItem('usuario_activo');
  if (!userActivoJson) {
    window.location.href = 'index.html';
  } else {
    try {
      const activeUser = JSON.parse(userActivoJson);
      const isAdmin = activeUser.rol === 'Admin';
      const hasPerm = activeUser.perms && activeUser.perms.includes('Cierre del Mes');
      if (!isAdmin && !hasPerm) {
         alert('Acceso Denegado: No tienes el permiso "Cierre del Mes".');
         window.location.href = 'administrador.html';
      }
    } catch(e){}
  }

  async function cargarBaseDeDatos() {"""

if target_cierre_mes in cierre_mes_content:
    cierre_mes_content = cierre_mes_content.replace(target_cierre_mes, new_cierre_mes)
    with open(cierre_mes_path, "w", encoding="utf-8") as f:
        f.write(cierre_mes_content)
    print("cierre_mes.html updated")

