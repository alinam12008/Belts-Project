const fs = require('fs');

const enKeys = {
    "admin_filter_sku_placeholder": "Filter by name or SKU...",
    "admin_auto_calculate_placeholder": "Leave empty to auto-calculate",
    "admin_eg_bearings_placeholder": "e.g. Bearings",
    "admin_direct_url_placeholder": "Or enter direct URL",
    "admin_detailed_desc_placeholder": "Detailed product descriptions or HTML specifications...",
    "admin_response_placeholder": "Type your response to customer...",
    "admin_property_placeholder": "Property (e.g. Width)",
    "admin_value_placeholder": "Value (e.g. 50mm)"
};

const arKeys = {
    "admin_filter_sku_placeholder": "تصفية حسب الاسم أو رمز المنتج...",
    "admin_auto_calculate_placeholder": "اتركه فارغاً للحساب التلقائي",
    "admin_eg_bearings_placeholder": "مثل: كراسي تحميل",
    "admin_direct_url_placeholder": "أو أدخل رابطاً مباشراً",
    "admin_detailed_desc_placeholder": "أوصاف مفصلة للمنتج أو مواصفات بصيغة HTML...",
    "admin_response_placeholder": "اكتب ردك للعميل...",
    "admin_property_placeholder": "الخاصية (مثل: العرض)",
    "admin_value_placeholder": "القيمة (مثل: 50مم)"
};

const enPath = './locales/en.json';
const arPath = './locales/ar.json';

let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));

Object.assign(enData, enKeys);
Object.assign(arData, arKeys);

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(arPath, JSON.stringify(arData, null, 2), 'utf8');
console.log("Updated locales.");
