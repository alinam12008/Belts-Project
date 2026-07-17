const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backupPath = path.join(root, 'data', 'products-backup.json');
const extraPath = path.join(root, 'data', 'products.json');
const targetPath = path.join(root, 'stitch_modern_belt_store_redesign', 'products_data.json');

function cleanText(value) {
  if (value == null) return '';
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function normalize(prod, index) {
  const title = cleanText(prod.name || prod.title || `Product ${index + 1}`);
  const breadcrumbs = [];
  const seen = new Set();
  const add = (value) => {
    const cleaned = cleanText(value).replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      breadcrumbs.push(cleaned);
      seen.add(key);
    }
  };

  add(prod.category || prod.categories?.[0]);
  add(prod.subcategory);
  add(prod.subSubcategory);

  const description = cleanText(prod.description || prod.shortDescription || prod.short_description || prod.full_description || '');
  const image = cleanText((Array.isArray(prod.images) ? prod.images[0] : '') || prod.image || '');

  return {
    title,
    url: prod.slug ? `https://belts-store.com/product/${prod.slug}/` : '',
    image,
    breadcrumbs,
    short_description: description || title,
    full_description: description || title,
    specs: prod.specifications || prod.specs || {},
    related: [],
    sku: prod.sku || '',
  };
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const extra = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
const normalized = [
  ...backup.map((product, index) => normalize(product, index)),
  ...extra.map((product, index) => normalize(product, index + backup.length)),
];

const unique = [];
const seenTitles = new Set();
for (const item of normalized) {
  const key = (item.title || '').toLowerCase().trim();
  if (!key || seenTitles.has(key)) continue;
  seenTitles.add(key);
  unique.push(item);
}

fs.writeFileSync(targetPath, JSON.stringify(unique, null, 2) + '\n');
console.log(`Wrote ${unique.length} products to ${path.relative(root, targetPath)}`);
