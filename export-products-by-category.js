/**
 * export-products-by-category.js
 *
 * Connects to beltsdb MongoDB, fetches every product,
 * creates a folder for each category under ./products/
 * and saves a JSON file per product inside it.
 *
 * Usage:  node export-products-by-category.js
 */

require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const mongoose = require('mongoose');

// ── DB Connection ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌  MONGODB_URI not found in .env');
  process.exit(1);
}

// ── Product Schema (mirror of db.js) ───────────────────────────
const ProductSchema = new mongoose.Schema({
  name:             { type: String },
  description:      { type: String },
  shortDescription: { type: String },
  category:         { type: String },
  subcategory:      { type: String },
  brand:            { type: String },
  sku:              { type: String },
  price:            { type: Number },
  discountPrice:    { type: Number },
  images:           [{ type: String }],
  specifications:   { type: Map, of: String },
  tags:             [{ type: String }],
  stock:            { type: Number },
  status:           { type: String },
  slug:             { type: String }
}, { timestamps: true });

// ── Helpers ─────────────────────────────────────────────────────
/**
 * Sanitise a string so it can be used as a folder / file name
 * on Windows and Linux.
 */
function safeName(str) {
  return (str || 'Uncategorized')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')   // illegal chars
    .replace(/\s+/g, '_')            // spaces → underscores
    .replace(/_+/g, '_')             // collapse multiple underscores
    .replace(/^_+|_+$/g, '');        // trim leading / trailing
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅  Connected to MongoDB.');

  // Use existing model or register fresh one
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  console.log('📦  Fetching all products…');
  const products = await Product.find({}).lean();
  console.log(`   Found ${products.length} products.`);

  if (products.length === 0) {
    console.log('⚠️   No products found in the database. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // Root output folder
  const OUTPUT_ROOT = path.join(__dirname, 'products');

  // Group products by category
  const byCategory = {};
  for (const p of products) {
    const cat = (p.category || 'Uncategorized').trim();
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const categories = Object.keys(byCategory);
  console.log(`\n📂  ${categories.length} categories found:`);
  categories.forEach(c => console.log(`     • ${c}  (${byCategory[c].length} products)`));

  // ── Write files ────────────────────────────────────────────────
  let totalSaved = 0;

  for (const category of categories) {
    const folderName = safeName(category);
    const folderPath = path.join(OUTPUT_ROOT, folderName);

    // Create category folder
    fs.mkdirSync(folderPath, { recursive: true });

    const catProducts = byCategory[category];

    for (const product of catProducts) {
      // Use slug or sku or _id as filename
      const fileBase = safeName(product.slug || product.sku || String(product._id));
      const filePath = path.join(folderPath, `${fileBase}.json`);

      // Convert Mongoose Map → plain object for JSON serialisation
      const data = { ...product };
      if (data.specifications instanceof Map) {
        data.specifications = Object.fromEntries(data.specifications);
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      totalSaved++;
    }

    console.log(`\n✔  [${folderName}]  saved ${catProducts.length} product(s)`);
  }

  // ── Summary ────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉  Done! ${totalSaved} products saved across ${categories.length} category folders.`);
  console.log(`📁  Output directory: ${OUTPUT_ROOT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌  Fatal error:', err.message);
  process.exit(1);
});
