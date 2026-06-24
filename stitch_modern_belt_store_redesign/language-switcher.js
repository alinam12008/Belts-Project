// Language Switcher Module
const LanguageSwitcher = (() => {
    const STORAGE_KEY = 'site_lang';
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'ar'];

    const init = () => {
        // Set current language on switcher
        const currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
        updateSwitcherUI(currentLang);
        
        // Add event listeners
        attachEventListeners();
    };

    const attachEventListeners = () => {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    };

    const setLanguage = (lang) => {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        
        localStorage.setItem(STORAGE_KEY, lang);
        updateSwitcherUI(lang);
        
        // Trigger i18n language change and wait for it to complete
        if (window.i18n && window.i18n.setLang) {
            const result = window.i18n.setLang(lang, false); // false = don't save again (we already did)
            // If setLang returns a Promise, wait for it
            if (result && typeof result.then === 'function') {
                result.catch(err => console.error('Translation error:', err));
            }
        }
    };

    const updateSwitcherUI = (lang) => {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === lang) {
                // Active state
                btn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
                btn.classList.remove('text-on-surface', 'hover:bg-on-surface/10');
            } else {
                // Inactive state
                btn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
                btn.classList.add('text-on-surface', 'hover:bg-on-surface/10');
            }
        });
    };

    return {
        init,
        setLanguage,
        updateSwitcherUI
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LanguageSwitcher.init);
} else {
    LanguageSwitcher.init();
}
