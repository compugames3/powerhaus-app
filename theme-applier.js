(function() {
    function adjustColor(hex, percent) {
        if (!hex) return hex;
        let r = parseInt(hex.substring(1,3), 16);
        let g = parseInt(hex.substring(3,5), 16);
        let b = parseInt(hex.substring(5,7), 16);
        r = Math.min(255, Math.max(0, r + Math.round(255 * (percent/100))));
        g = Math.min(255, Math.max(0, g + Math.round(255 * (percent/100))));
        b = Math.min(255, Math.max(0, b + Math.round(255 * (percent/100))));
        return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
    }

    function hexToRgba(hex, alpha) {
        if (!hex) return hex;
        let r = parseInt(hex.substring(1,3), 16);
        let g = parseInt(hex.substring(3,5), 16);
        let b = parseInt(hex.substring(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    window.applyTitanTheme = function() {
        if (window.location.pathname.includes('index.html')) return;
        
        const stored = localStorage.getItem('titangym_theme');
        if (!stored) {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.fontSize = '14px';
            let existing = document.getElementById('dynamic-theme-overrides');
            if (existing) {
                existing.innerHTML = '';
            }
            return;
        }
        
        let theme;
        try { theme = JSON.parse(stored); } catch(e) { return; }

        if (theme.mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (theme.fontSize) {
            document.documentElement.style.fontSize = theme.fontSize + 'px';
        }

        const baseHex = theme.accent || '#004cf0';
        const darkHex = adjustColor(baseHex, -15);
        const lightRgba = hexToRgba(baseHex, 0.08);

        let styleStr = '';

        if (theme.font) {
            styleStr += `
                body, .font-body, .font-headline { 
                    font-family: "${theme.font}", sans-serif !important; 
                }
            `;
            // Cargar la fuente de Google dinámicamente si no está en la página
            if (!document.querySelector(`link[href*="${theme.font}"]`)) {
                let l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = `https://fonts.googleapis.com/css2?family=${theme.font}:wght@300;400;500;600;700;800&display=swap`;
                document.head.appendChild(l);
            }
        }

        if (baseHex !== '#004cf0') {
            // Generar reglas CSS de anulación estricta con !important
            styleStr += `
                .bg-\\[\\#004cf0\\], .bg-blue-600 { background-color: ${baseHex} !important; }
                .text-\\[\\#004cf0\\], .text-blue-600, .text-blue-700 { color: ${baseHex} !important; }
                .border-\\[\\#004cf0\\], .border-blue-600, .border-blue-500 { border-color: ${baseHex} !important; }
                button:hover.bg-\\[\\#004cf0\\], button:hover.bg-blue-600 { background-color: ${darkHex} !important; }
                .hover\\:bg-\\[\\#0038b6\\]:hover { background-color: ${darkHex} !important; }
                .hover\\:text-\\[\\#004cf0\\]:hover { color: ${baseHex} !important; }
                .focus\\:border-\\[\\#004cf0\\]:focus { border-color: ${baseHex} !important; }
                
                .bg-\\[\\#0038b6\\] { background-color: ${darkHex} !important; }
                .text-\\[\\#0038b6\\] { color: ${darkHex} !important; }
                
                .bg-\\[\\#eef2ff\\], .bg-blue-50 { background-color: ${lightRgba} !important; }
                .hover\\:bg-\\[\\#eef2ff\\]:hover, .hover\\:bg-blue-50:hover { background-color: ${lightRgba} !important; }
            `;
        }

        // --- DARK MODE GLOBAL OVERRIDES ---
        if (theme.mode === 'dark') {
            styleStr += `
                /* Body & Roots */
                body, .bg-\\[\\#f8f9fc\\], .bg-slate-50 { background-color: #020617 !important; color: #f8fafc !important; }
                
                /* Cards & Surfaces */
                .bg-white, .bg-surface-container-lowest, .bg-surface-bright, .bg-surface { background-color: #0f172a !important; border-color: #1e293b !important; }
                .bg-\\[\\#ffffff\\] { background-color: #0f172a !important; border-color: #1e293b !important; }
                .bg-slate-100, .bg-\\[\\#eef0f6\\], .bg-surface-container-low, .bg-surface-container, .bg-surface-container-high, .bg-surface-container-highest { background-color: #1e293b !important; }
                .bg-slate-200 { background-color: #334155 !important; }
                
                /* Text Hierarchies */
                .text-slate-800, .text-slate-900, .text-on-background, .text-on-surface, h1, h2, h3, h4, h5, h6 { color: #f8fafc !important; }
                .text-slate-700 { color: #e2e8f0 !important; }
                .text-slate-600, .text-slate-500 { color: #94a3b8 !important; }
                .text-slate-400 { color: #64748b !important; }
                
                /* Borders */
                .border-slate-100, .border-slate-200, .border-white { border-color: #1e293b !important; }
                
                /* Inputs & Components */
                input, select, textarea { 
                    background-color: #1e293b !important; 
                    color: #f8fafc !important; 
                    border-color: #334155 !important; 
                }
                
                /* Sidebar Adjustments */
                aside { background-color: #0f172a !important; border-right-color: #1e293b !important; }
                header { background-color: rgba(15, 23, 42, 0.8) !important; border-bottom-color: #1e293b !important; }
                
                /* Dark Mode Dynamic Hovers */
                .hover\\:bg-slate-50:hover, .hover\\:bg-slate-100:hover, .hover\\:bg-slate-200:hover, .hover\\:bg-white:hover {
                    background-color: #334155 !important;
                }
                
                /* Dark Mode Custom Scrollbars */
                ::-webkit-scrollbar { width: 10px; height: 10px; }
                ::-webkit-scrollbar-track { background: #0f172a !important; border-radius: 8px; }
                ::-webkit-scrollbar-thumb { background: #334155 !important; border-radius: 8px; }
                ::-webkit-scrollbar-thumb:hover { background: #475569 !important; }
                ::-webkit-scrollbar-corner { background: #0f172a !important; }
                
                /* SweetAlert Dark Mode Fixes */
                .swal2-popup { background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #1e293b !important; }
                .swal2-title, .swal2-html-container { color: #f8fafc !important; }
                .hover\\:bg-\\[\\#eef0f6\\]:hover { background-color: #334155 !important; }
            `;
        }

        if (theme.borderRadius) {
            let brPx = '12px';
            let cardBrPx = '16px';
            if(theme.borderRadius === 'sharp') { brPx = '4px'; cardBrPx = '4px'; }
            if(theme.borderRadius === 'soft') { brPx = '12px'; cardBrPx = '12px'; }
            if(theme.borderRadius === 'round') { brPx = '24px'; cardBrPx = '24px'; }
            if(theme.borderRadius === 'pill') { brPx = '9999px'; cardBrPx = '28px'; } // Previene que las cards grandes se vuelvan óvalos

            styleStr += `
                .rounded-xl, .rounded-\\[14px\\], .rounded-\\[12px\\] { 
                    border-radius: ${brPx} !important; 
                }
                .rounded-2xl, .rounded-3xl { 
                    border-radius: ${cardBrPx} !important; 
                }
                .w-10, .w-12, .h-10, .h-12, .w-16, .h-16, .w-20, .h-20, .w-24, .h-24, .rounded-full { border-radius: 9999px !important; } /* Proteger avatars */
            `;
        }

        if (theme.textColor && theme.mode !== 'dark') {
            styleStr += `
                .text-slate-800, .text-slate-900, .text-slate-700, .text-slate-600, h1, h2, h3, h4 { 
                    color: ${theme.textColor} !important; 
                }
            `;
        }

        if (styleStr) {
            let existing = document.getElementById('dynamic-theme-overrides');
            if (!existing) {
                existing = document.createElement('style');
                existing.id = 'dynamic-theme-overrides';
                document.head.appendChild(existing);
            }
            existing.innerHTML = styleStr;
        }
    }

    window.applyTitanTheme();
    document.addEventListener('DOMContentLoaded', window.applyTitanTheme);

    // --- GLOBAL BRANDING OVERRIDES ---
    window.applyBrandText = function() {
        const savedTitle = localStorage.getItem('powerhaus_brand_title');
        const savedSubtitle = localStorage.getItem('powerhaus_brand_subtitle');

        const h1s = document.querySelectorAll('h1.text-\\[1\\.3rem\\]');
        h1s.forEach(h1 => {
            if (savedTitle) h1.innerText = savedTitle;
            const p = h1.nextElementSibling;
            if(p && p.tagName === 'P') {
                if (savedSubtitle) p.innerText = savedSubtitle;
            }
        });

        // Login screen span
        const loginSpans = document.querySelectorAll('span.text-3xl.italic.font-headline');
        loginSpans.forEach(s => {
            if (savedTitle) s.innerText = savedTitle;
        });

        // Any inline brand text
        const brandSpans = document.querySelectorAll('.brand-name-text');
        brandSpans.forEach(s => {
            if (savedTitle) s.innerText = savedTitle;
        });
    };
    
    document.addEventListener('DOMContentLoaded', window.applyBrandText);

    // --- GLOBAL GOOGLE TRANSLATOR INTEGRATION ---
    document.addEventListener('DOMContentLoaded', () => {
        // 1. Añadir el div de google_translate_element
        if (!document.getElementById('google_translate_element')) {
            let gtDiv = document.createElement('div');
            gtDiv.id = 'google_translate_element';
            gtDiv.style.display = 'none';
            document.body.appendChild(gtDiv);
        }
        
        // 2. Añadir los estilos invisibles de Google Translate
        let gtStyles = document.createElement('style');
        gtStyles.innerHTML = `
            body { top: 0 !important; }
            .skiptranslate iframe { display: none !important; }
            #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `;
        document.head.appendChild(gtStyles);

        // 3. Exponer funciones globalmente en ventana (si no exiten, o sobrescribirlas)
        window.updateLanguageUI = function(lang) {
            const langMapping = { 'en': 'btn-lang-en', 'ja': 'btn-lang-ja', 'ko': 'btn-lang-ko', 'es': 'btn-lang-es' };
            Object.values(langMapping).forEach(id => {
                document.querySelectorAll('.' + id).forEach(btn => {
                    btn.classList.remove('text-blue-600', 'font-bold');
                    btn.classList.add('text-slate-700', 'dark:text-slate-300', 'font-medium');
                    const code = btn.querySelector('.lang-code');
                    if(code) { code.classList.remove('text-blue-600'); code.classList.add('text-slate-400'); }
                });
            });
            const activeClase = langMapping[lang] || 'btn-lang-es';
            document.querySelectorAll('.' + activeClase).forEach(btn => {
                btn.classList.remove('text-slate-700', 'dark:text-slate-300', 'font-medium');
                btn.classList.add('text-blue-600', 'font-bold');
                const code = btn.querySelector('.lang-code');
                if(code) { code.classList.remove('text-slate-400'); code.classList.add('text-blue-600'); }
            });
        };

        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({pageLanguage: 'es', includedLanguages: 'en,ja,ko'}, 'google_translate_element');
            
            const savedLang = localStorage.getItem('lenguaje_activo') || 'es';
            window.updateLanguageUI(savedLang);
            
            const checkInterval = setInterval(() => {
                var selectField = document.querySelector('select.goog-te-combo');
                if (selectField && selectField.options.length > 0) {
                    clearInterval(checkInterval);
                    if (savedLang && savedLang !== 'es') {
                        if (selectField.value !== savedLang) {
                            selectField.value = savedLang;
                            selectField.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }
            }, 100);
        };

        window.traductor = function(lang) {
            const currentLang = localStorage.getItem('lenguaje_activo') || 'es';
            if (currentLang === lang) return;

            localStorage.setItem('lenguaje_activo', lang);
            window.updateLanguageUI(lang);
            
            if(lang === 'es') {
                localStorage.removeItem('lenguaje_activo');
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
                window.location.reload();
                return;
            }

            var selectField = document.querySelector('select.goog-te-combo');
            if (selectField) {
                if (selectField.value !== lang) {
                    selectField.value = lang;
                    selectField.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                window.location.reload();
            }
        };

        // 4. Inyectar script ofcial de Google Translate
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            let s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(s);
        }
    });

})();
