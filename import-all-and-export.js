/**
 * import-all-and-export.js
 *
 * 1. Connects to beltsdb MongoDB
 * 2. Clears existing products
 * 3. Imports ALL products from products_data.json
 * 4. Creates ./products/<Category>/<slug>.json for every product
 *
 * Usage: node import-all-and-export.js
 */

require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌  MONGODB_URI not found in .env'); process.exit(1); }

// ── Schema ──────────────────────────────────────────────────────
const ProductSchema = new mongoose.Schema({
  name:             String,
  description:      { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  category:         String,
  subcategory:      { type: String, default: '' },
  brand:            { type: String, default: 'Optibelt' },
  sku:              { type: String, required: true, unique: true },
  price:            { type: Number, default: 0 },
  discountPrice:    { type: Number, default: 0 },
  images:           [String],
  specifications:   { type: Map, of: String },
  tags:             [String],
  stock:            { type: Number, default: 0 },
  status:           { type: String, default: 'Active' },
  slug:             String
}, { timestamps: true });

// ── Helpers ──────────────────────────────────────────────────────
function safeName(str) {
  return (str || 'Uncategorized')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeSlug(str, idx) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `product-${idx}`;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('✅  Connected to MongoDB.\n');

  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  // ── 1. Load source data ──────────────────────────────────────
  const srcPath = path.join(__dirname, 'stitch_modern_belt_store_redesign', 'products_data.json');
  if (!fs.existsSync(srcPath)) {
    console.error('❌  products_data.json not found at:', srcPath);
    await mongoose.disconnect(); return;
  }
  const rawData = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  console.log(`📄  Source file has ${rawData.length} products.\n`);

  // ── 2. Clear existing products ───────────────────────────────
  const existing = await Product.countDocuments();
  console.log(`🗑   Removing ${existing} existing product(s) from DB…`);
  await Product.deleteMany({});
  console.log('    Cleared.\n');

  // ── 3. Build & insert all products ──────────────────────────
  console.log('⬆️   Importing all products into MongoDB…');
  const OUTPUT_ROOT = path.join(__dirname, 'products');

  // Remove old export folder so we start fresh
  if (fs.existsSync(OUTPUT_ROOT)) {
    fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true });
  }

  const byCategory = {};
  const skuSeen    = new Set();
  let   imported   = 0;
  let   skipped    = 0;

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i];

    const category    = (raw.breadcrumbs && raw.breadcrumbs[0]) || 'Uncategorized';
    const subcategory = (raw.breadcrumbs && raw.breadcrumbs[1]) || '';
    const name        = (raw.title || 'Unnamed Product').trim();
    const slug        = makeSlug(name, i);
    const sku         = (raw.sku || `SKU-${1000 + i}`).trim();

    // Skip duplicates (same SKU)
    if (skuSeen.has(sku)) { skipped++; continue; }
    skuSeen.add(sku);

    const basePrice = 45 + Math.floor(Math.random() * 350);
    const discPrice = basePrice > 100 ? basePrice - 15 - Math.floor(Math.random() * 20) : basePrice;

    const specs = {};
    if (raw.specs && typeof raw.specs === 'object') {
      for (const [k, v] of Object.entries(raw.specs)) {
        specs[k] = String(v);
      }
    }

    const doc = {
      name,
      description:      raw.full_description || '',
      shortDescription: raw.short_description || '',
      category,
      subcategory,
      brand:            'Optibelt',
      sku,
      price:            basePrice,
      discountPrice:    discPrice,
      images:           raw.image ? [raw.image] : [],
      specifications:   specs,
      tags:             [category, subcategory].filter(Boolean),
      stock:            10 + Math.floor(Math.random() * 90),
      status:           'Active',
      slug
    };

    // Save to MongoDB
    try {
      await Product.create(doc);
    } catch (err) {
      if (err.code === 11000) { skipped++; continue; }  // duplicate key
      throw err;
    }

    // Collect for local export
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ ...doc, _id: undefined });

    imported++;
  }

  console.log(`   ✅  ${imported} products imported  (${skipped} duplicates skipped)\n`);

  // ── 4. Write local files ─────────────────────────────────────
  console.log('💾  Writing product files to disk…\n');

  for (const [category, products] of Object.entries(byCategory)) {
    const folderPath = path.join(OUTPUT_ROOT, safeName(category));
    fs.mkdirSync(folderPath, { recursive: true });

    for (const p of products) {
      const fileName = safeName(p.slug || p.sku) + '.json';
      const filePath = path.join(folderPath, fileName);

      // Convert Map → plain object (safety)
      const data = { ...p };
      if (data.specifications instanceof Map) {
        data.specifications = Object.fromEntries(data.specifications);
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    console.log(`  📂  ${safeName(category)}/  →  ${products.length} file(s)`);
  }

  // ── 5. Summary ────────────────────────────────────────────────
  const totalCats = Object.keys(byCategory).length;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉  Complete!`);
  console.log(`    Products in DB  : ${imported}`);
  console.log(`    Categories      : ${totalCats}`);
  console.log(`    Output folder   : ${OUTPUT_ROOT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌  Fatal error:', err.message);
  process.exit(1);
});
