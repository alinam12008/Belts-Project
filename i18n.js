/**
 * i18n.js — Hybrid Translation Engine
 * ─────────────────────────────────────────────────────
 * Combines explicit data-i18n tags with a robust bidirectional DOM text-walker.
 * This ensures static layout remains stable, while dynamically fetched content 
 * (like product names) is translated automatically based on our dictionaries.
 */
(function () {
    'use strict';

    // ── Config ───────────────────────────────────────────────────────────────
    const STORAGE_KEY   = 'site_lang';
    const DEFAULT_LANG  = 'en';
    const ALLOWED_LANGS = ['en', 'ar'];
    const RTL_LANGS     = ['ar'];

    // ── State ────────────────────────────────────────────────────────────────
    let currentLang  = sanitizeLang(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG);
    let translations = { en: {}, ar: {} };
    let loadedLangs  = new Set();
    
    // Bidirectional dictionaries for the DOM Walker
    let dictEnToAr = {}; // "V Belts" -> "سيور V"
    let dictArToEn = {}; // "سيور V" -> "V Belts"

    let observer     = null;
    let isApplying   = false;

    function sanitizeLang(lang) {
        return ALLOWED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
    }

    function t(key, lang) {
        lang = lang || currentLang;
        const map = translations[lang] || translations[DEFAULT_LANG] || {};
        return map[key] !== undefined ? map[key] : null;
    }

    // ── Fetch Locales and Build Dictionaries ────────────────────────────────
    function fetchLocale(lang) {
        if (loadedLangs.has(lang)) return Promise.resolve();
        return fetch('/api/language/' + lang)
            .then(r => {
                if (!r.ok) throw new Error('Failed to load locale: ' + lang);
                return r.json();
            })
            .then(data => {
                translations[lang] = data;
                loadedLangs.add(lang);
                buildBidirectionalDicts();
            })
            .catch(err => {
                console.warn('[i18n] ' + err.message);
                translations[lang] = translations[lang] || {};
                loadedLangs.add(lang);
            });
    }

    function buildBidirectionalDicts() {
        if (!loadedLangs.has('en') || !loadedLangs.has('ar')) return;
        dictEnToAr = {};
        dictArToEn = {};
        
        const enData = translations['en'];
        const arData = translations['ar'];

        for (const key in enData) {
            const enStr = enData[key].trim();
            const arStr = (arData[key] || '').trim();
            if (enStr && arStr && enStr !== arStr) {
                // Map the exact strings
                dictEnToAr[enStr] = arStr;
                dictArToEn[arStr] = enStr;
                // Map upper/lower case variants for safety
                dictEnToAr[enStr.toUpperCase()] = arStr;
                dictEnToAr[enStr.toLowerCase()] = arStr;
            }
        }
    }

    // ── Fetch and Build Product Translation Dictionary ──────────────────────
    function fetchProductTranslations() {
        return Promise.all([
            fetch('/stitch_modern_belt_store_redesign/products-translations-en.json').then(r => r.json()).catch(() => ({})),
            fetch('/stitch_modern_belt_store_redesign/products-translations-ar.json').then(r => r.json()).catch(() => ({}))
        ])
        .then(([enProducts, arProducts]) => {
            const enProdNames = enProducts.product_names || {};
            const arProdNames = arProducts.product_names || {};
            
            // Add product names to dictionaries
            for (const enName in enProdNames) {
                const arName = arProdNames[enName] || '';
                if (enName && arName && enName !== arName) {
                    dictEnToAr[enName] = arName;
                    dictArToEn[arName] = enName;
                    // Add variants
                    dictEnToAr[enName.toUpperCase()] = arName;
                    dictEnToAr[enName.toLowerCase()] = arName;
                }
            }
        })
        .catch(err => {
            console.warn('[i18n] Failed to load product translations:', err.message);
        });
    }

    // ── Translation Appliers ─────────────────────────────────────────────────

    // 1. Explicit Attributes (data-i18n)
    function stampElement(el) {
        const key = el.getAttribute('data-i18n');
        if (key) {
            const val = t(key);
            if (val !== null) {
                let hasChildElements = false;
                el.childNodes.forEach(child => {
                    if (child.nodeType === Node.ELEMENT_NODE) hasChildElements = true;
                });
                if (hasChildElements) {
                    el.childNodes.forEach(child => {
                        if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
                            child.nodeValue = ' ' + val + ' ';
                        }
                    });
                } else {
                    el.textContent = val;
                }
            }
        }
        const htmlKey = el.getAttribute('data-i18n-html');
        if (htmlKey) {
            const val = t(htmlKey);
            if (val !== null) el.innerHTML = val;
        }
        const phKey = el.getAttribute('data-i18n-placeholder');
        if (phKey) {
            const val = t(phKey);
            if (val !== null) el.setAttribute('placeholder', val);
        }
        const titleKey = el.getAttribute('data-i18n-title');
        if (titleKey) {
            const val = t(titleKey);
            if (val !== null) el.setAttribute('title', val);
        }
    }

    // 2. DOM Walker for untagged dynamic text (like products)
    function walkAndTranslate(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const originalText = node.nodeValue;
            const trimmed = originalText.trim();
            if (!trimmed || trimmed.length <= 1) return;

            // Don't translate text inside scripts/styles or material icons
            if (node.parentNode) {
                const pTag = node.parentNode.tagName;
                if (pTag === 'SCRIPT' || pTag === 'STYLE') return;
                if (node.parentNode.classList && node.parentNode.classList.contains('material-symbols-outlined')) return;
            }

            // Skip if this node's parent has data-i18n (it was already translated securely)
            if (node.parentNode && node.parentNode.hasAttribute && node.parentNode.hasAttribute('data-i18n')) return;

            let replacement = null;
            if (currentLang === 'ar') {
                if (dictEnToAr[trimmed]) replacement = dictEnToAr[trimmed];
                // Try case-insensitive matching if not found
                else if (dictEnToAr[trimmed.toUpperCase()]) replacement = dictEnToAr[trimmed.toUpperCase()];
                else if (dictEnToAr[trimmed.toLowerCase()]) replacement = dictEnToAr[trimmed.toLowerCase()];
                
                // Add robust substring replacement for common description terms
                const descDict = {
                    "Type:": "النوع:",
                    "Length:": "الطول:",
                    "Length Range:": "نطاق الطول:",
                    "Sizes:": "المقاسات:",
                    "Sizes (Opening):": "المقاسات (الفتحة):",
                    "Size:": "المقاس:",
                    "Width:": "العرض:",
                    "Thickness Available :": "السماكات المتوفرة:",
                    "Thickness Available:": "السماكات المتوفرة:",
                    "Sheet Sizes:": "مقاسات الألواح:",
                    "Number of Ply:": "عدد الطبقات:",
                    "Ply:": "الطبقات:",
                    "Wire Thickness:": "سماكة السلك:",
                    "Sections:": "الأقسام:",
                    "Dimensions:": "الأبعاد:",
                    "Made in": "صنع في",
                    "Made in:": "صنع في:",
                    "Spain": "إسبانيا",
                    "Taiwan": "تايوان",
                    "China": "الصين",
                    "India": "الهند",
                    "Pulgaria": "بلغاريا",
                    "Open": "مفتوح",
                    "Item Code:": "كود الصنف:",
                    "more info.": "مزيد من المعلومات.",
                    "more info": "مزيد من المعلومات",
                    "Standard": "قياسي",
                    "From": "من",
                    "from": "من",
                    "up to": "حتى",
                    "customer requirement.": "متطلبات العميل.",
                    "varies depend on the opening size": "يختلف حسب حجم الفتحة",
                    "Steel Punch": "ثاقب فولاذي",
                    "Impact Rollers (Rollers with Rubber)": "بكرات التصادم (بكرات مع مطاط)",
                    "Steel Rollers": "بكرات فولاذية",
                    "Metre goods": "بضائع بالمتر",
                    "Rolls measuring": "لفات بقياس",
                    "Timing belts for fan drives": "سيور التوقيت لمحركات المروحة",
                    "Standard width": "العرض القياسي",
                    "Pillow Blocks / UCT Type": "كراسي تحميل / نوع UCT",
                    "Double Pitch": "خطوة مزدوجة",
                    "Type: Standard Conveyor Chain With Attachments": "النوع: سلسلة ناقلة قياسية مع ملحقات",
                    "Type: Standard Conveyor Chain Double Pitch": "النوع: سلسلة ناقلة قياسية مزدوجة الخطوة",
                    "Type: Agricultural Roller Chain": "النوع: سلسلة أسطوانة زراعية",
                    "Type: Steel Screen": "النوع: شاشة فولاذية",
                    "Type: Steel": "النوع: فولاذ",
                    "Type: Connecting Links": "النوع: حلقات توصيل",
                    "Property": "الخاصية",
                    "Specification Value": "قيمة المواصفات",
                    "Details": "التفاصيل",
                    "Category": "الفئة",
                    "Subcategory": "الفئة الفرعية",
                    "Compliance": "الامتثال",
                    "Related Components": "مكونات ذات صلة",
                    "RELATED COMPONENTS": "مكونات ذات صلة",
                    "Ref:": "المرجع:",
                    "SPECS": "المواصفات",
                    "Detailed description and catalog files are available upon inquiry.": "الوصف التفصيلي وملفات الكتالوج متوفرة عند الطلب.",
                    "No related components currently listed in inventory.": "لا توجد مكونات ذات صلة مدرجة حالياً في المخزون.",
                    "V Belts": "سيور V",
                    "Special Belts": "سيور خاصة",
                    "Power Transmission": "نقل القدرة",
                    "Belts Power Transmission": "سيور نقل القدرة",
                    "Component": "مكون",
                    "Industrial": "صناعي",
                    "Transmission Chains And Sprockets": "سلاسل النقل والتروس",
                    "Bearings": "رولمان بلي (محامل)",
                    "Conveying Accessorise": "ملحقات النقل",
                    "Pulleys": "بكرات",
                    "Industrial Insulation": "عزل صناعي",
                    "Rubber": "مطاط",
                    "Transmission chain": "سلسلة نقل",
                    "Emergency and Transport Belts": "سيور الطوارئ والنقل",
                    "Bearing Units and Plummer Block Housing": "وحدات المحامل ومبيتات الكراسي",
                    "Couplings": "قارنات",
                    "Radial Ball Bearings": "رولمان بلي شعاعي",
                    "Radial Roller Bearings": "محامل أسطوانية شعاعية",
                    "Thrust Ball Bearings": "رولمان بلي دفعي",
                    "Timing Belts": "سيور التوقيت",
                    "Ribbed Belts": "سيور مضلعة",
                    "Measurement and Testing Tools": "أدوات القياس والاختبار",
                    "Repair Kits and Tension Tools": "أطقم الإصلاح وأدوات الشد",
                    "Round Belts": "سيور دائرية",
                    "Sprockets": "تروس"
                };

                if (!replacement) {
                    let newText = originalText;
                    let replaced = false;
                    
                    // Sort keys by length descending to prevent partial substring replacements (e.g. Subcategory matched by Category)
                    const sortedKeys = Object.keys(descDict).sort((a, b) => b.length - a.length);
                    
                    for (const enTerm of sortedKeys) {
                        const arTerm = descDict[enTerm];
                        if (newText.includes(enTerm)) {
                            newText = newText.replace(new RegExp(enTerm, 'g'), arTerm);
                            replaced = true;
                        }
                    }
                    if (replaced) {
                        node.nodeValue = newText;
                        return;
                    }
                }
            } else if (currentLang === 'en') {
                if (dictArToEn[trimmed]) replacement = dictArToEn[trimmed];
            }

            if (replacement) {
                node.nodeValue = originalText.replace(trimmed, replacement);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Apply attributes
            if (node.hasAttribute('placeholder')) {
                const ph = node.getAttribute('placeholder').trim();
                let replacement = null;
                if (currentLang === 'ar' && dictEnToAr[ph]) replacement = dictEnToAr[ph];
                else if (currentLang === 'en' && dictArToEn[ph]) replacement = dictArToEn[ph];
                if (replacement) node.setAttribute('placeholder', replacement);
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                walkAndTranslate(node.childNodes[i]);
            }
        }
    }

    // ── Apply to Entire Document ─────────────────────────────────────────────
    function applyToDocument() {
        // 1. First apply strict explicit keys
        document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title]')
            .forEach(stampElement);
        
        // 2. Then walk the DOM to catch any dynamic untagged text (products)
        walkAndTranslate(document.body);
    }

    // ── Document Setup ───────────────────────────────────────────────────────
    function applyDirection(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir  = 'ltr';
        document.documentElement.setAttribute('data-lang', lang);
    }

    // ── Observer for dynamic content ─────────────────────────────────────────
    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(mutations => {
            if (isApplying) return;
            isApplying = true; // prevent infinite loops
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute && (
                            node.hasAttribute('data-i18n') || node.hasAttribute('data-i18n-html') ||
                            node.hasAttribute('data-i18n-placeholder') || node.hasAttribute('data-i18n-title')
                        )) {
                            stampElement(node);
                        }
                        node.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title]')
                            .forEach(stampElement);
                        
                        walkAndTranslate(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        walkAndTranslate(node);
                    }
                });
            });
            isApplying = false;
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    // ── Set Language API ─────────────────────────────────────────────────────
    function setLang(lang, save) {
        lang = sanitizeLang(lang);
        if (save !== false) localStorage.setItem(STORAGE_KEY, lang);
        currentLang = lang;

        return Promise.all([fetchLocale('en'), fetchLocale(lang), fetchProductTranslations()])
            .then(() => {
                isApplying = true;
                applyDirection(lang);
                applyToDocument();

                // Notify UI components
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));

                const sel = document.getElementById('site-lang-select');
                if (sel && sel.value !== lang) sel.value = lang;

                isApplying = false;
                startObserver();
            });
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    function init() {
        return Promise.all([fetchLocale('en'), fetchLocale('ar'), fetchProductTranslations()])
            .then(() => {
                isApplying = true;
                applyDirection(currentLang);
                applyToDocument();
                isApplying = false;
                startObserver();

                const sel = document.getElementById('site-lang-select');
                if (sel) sel.value = currentLang;
            });
    }

    window.i18n = {
        currentLang: () => currentLang,
        setLang: (lang) => setLang(lang, true),
        t: t,
        isLoaded: () => loadedLangs.has(currentLang),
        init: init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();