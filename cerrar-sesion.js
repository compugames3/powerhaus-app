async function cerrarSesion(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    // ── Pantalla de cierre visual ──────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed','inset:0','z-index:99999',
        'background:rgba(15,21,53,1)',
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'gap:1.5rem','color:#fff',
        'font-family:Inter,Segoe UI,sans-serif',
        'transition:opacity .3s'
    ].join(';');
    
    overlay.innerHTML = `
        <div style="width:52px;height:52px;border:4px solid rgba(255,255,255,.15);
            border-top-color:#4d90ff;border-radius:50%;
            animation:spin .8s linear infinite;"></div>
        <p style="font-size:1.1rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.9);">
            Cerrando sesión...
        </p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(overlay);

    // ── Limpiar sesión local y configuraciones de diseño inmediatamente ──
    localStorage.removeItem('usuario_activo');
    localStorage.removeItem('userToEdit');
    localStorage.removeItem('titangym_theme');
    // Note: NOT clearing historialCierres so it is preserved
    sessionStorage.clear();



    // Redirigir suavemente al login; al estar el servidor apagado,
    // el usuario deberá volver a arrancar el sistema con su ejecutable.
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

