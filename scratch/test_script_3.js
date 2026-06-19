
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({pageLanguage: 'es', includedLanguages: 'en,ja,ko'}, 'google_translate_element');
      
      const savedLang = localStorage.getItem('lenguaje_activo') || 'es';
      if(savedLang === 'es') return;
      
      const checkInterval = setInterval(() => {
        var selectField = document.querySelector('select.goog-te-combo');
        if (selectField && selectField.options.length > 0) {
          clearInterval(checkInterval);
          if (selectField.value !== savedLang) {
              selectField.value = savedLang;
              selectField.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, 100);
    }
