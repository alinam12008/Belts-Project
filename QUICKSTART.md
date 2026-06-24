# 🚀 Quick Start - Language Switcher Usage

## What's Ready

Your Belts Store website now has a complete language switching system with:
- ✅ **140+ product names** in both English and Arabic
- ✅ **Full footer translations**
- ✅ **Language selector** in the header (EN/AR buttons)
- ✅ **RTL layout** for Arabic
- ✅ **Language persistence** (saved in browser)
- ✅ **Zero external services** - completely internal

## How to Use

### For Website Visitors

1. **Open the website** - English is the default
2. **Locate EN/AR buttons** in the top-right corner of the header
3. **Click AR** to switch to Arabic
   - All text translates instantly
   - Layout changes to right-to-left
   - All product names translate
4. **Click EN** to switch back to English
5. **Your language preference is saved** - page will remember it next time you visit

### For Development

#### To test locally:
```bash
cd Belts-Project
npm start
# Visit http://localhost:3000
# Click EN/AR buttons to test
```

#### To add more products:
1. Add product names to both translation files:
   - `stitch_modern_belt_store_redesign/products-translations-en.json`
   - `stitch_modern_belt_store_redesign/products-translations-ar.json`

Example:
```json
{
  "product_names": {
    "My New Product": "My New Product",
    "Product Name": "أسم المنتج"
  }
}
```

2. Restart the server - products will auto-translate

#### To add a new language (e.g., Spanish):
1. Create `locales/es.json` with Spanish translations
2. Create `stitch_modern_belt_store_redesign/products-translations-es.json`
3. Update `stitch_modern_belt_store_redesign/language-switcher.js`:
   ```javascript
   const SUPPORTED_LANGS = ['en', 'ar', 'es'];
   ```
4. Add button to `stitch_modern_belt_store_redesign/index.html` and other pages:
   ```html
   <button id="lang-es" class="lang-btn px-3 py-2 rounded text-xs font-bold transition-colors hover:bg-on-surface/10" data-lang="es">ES</button>
   ```

## Files to Know

| File | Purpose |
|------|---------|
| `stitch_modern_belt_store_redesign/language-switcher.js` | Handles button clicks and language switching |
| `stitch_modern_belt_store_redesign/products-translations-en.json` | 140+ English product names |
| `stitch_modern_belt_store_redesign/products-translations-ar.json` | 140+ Arabic product names |
| `locales/en.json` | English UI strings |
| `locales/ar.json` | Arabic UI strings |
| `i18n.js` | Translation engine (fetches and applies translations) |

## Troubleshooting

### EN/AR buttons not visible?
- Check browser developer console (F12) for errors
- Verify `language-switcher.js` is loaded
- Clear browser cache and refresh

### Products not translating?
- Verify product name matches exactly in translation files
- Check JSON files are valid (no syntax errors)
- Clear cache and restart server

### Language not saving between sessions?
- Check browser localStorage is enabled
- Check browser console for errors

### RTL layout looks wrong?
- Clear browser cache
- Check that Tailwind CSS is fully loaded
- Refresh the page

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Translation files are cached by browser
- Minimal performance impact
- No external API calls or delays
- Instant translation on button click

## Accessibility

- Language attribute (`lang="ar"` / `lang="en"`) set correctly
- Screen readers respect language setting
- All text properly marked for translation
- Semantic HTML maintained

---

**Questions?** Check the full documentation in `TRANSLATION_SYSTEM.md`
