const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'stitch_modern_belt_store_redesign');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Footer replacements
    content = content.replace(/<span class="font-headline-lg text-headline-lg font-bold text-on-primary mb-6 block">BELTS STORE<\/span>/g, '<span class="font-headline-lg text-headline-lg font-bold text-on-primary mb-6 block" data-i18n="brand">BELTS STORE</span>');
    content = content.replace(/Supplying global industries with premium power transmission components since 1994\. Quality certified and engineering backed\./g, '<span data-i18n="footer_description">Supplying global industries with premium power transmission components since 1994. Quality certified and engineering backed.</span>');
    
    // Footer Navigation headers
    content = content.replace(/<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold">Navigation<\/h4>/g, '<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold" data-i18n="navigation">Navigation</h4>');
    content = content.replace(/<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold">Categories<\/h4>/g, '<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold" data-i18n="categories_footer">Categories</h4>');
    content = content.replace(/<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold">Industrial Newsletter<\/h4>/g, '<h4 class="font-label-sm text-label-sm uppercase tracking-wider mb-6 text-secondary-fixed font-bold" data-i18n="newsletter">Industrial Newsletter</h4>');
    
    // Footer Newsletter text & input
    content = content.replace(/<p class="text-xs opacity-70 mb-4">Receive technical updates and inventory arrivals\.<\/p>/g, '<p class="text-xs opacity-70 mb-4" data-i18n="newsletter_text">Receive technical updates and inventory arrivals.</p>');
    content = content.replace(/placeholder="Email address"/g, 'placeholder="Email address" data-i18n-placeholder="email_placeholder"');
    content = content.replace(/<button class="bg-secondary-fixed text-on-secondary-fixed px-6 font-bold hover:bg-secondary transition-colors">JOIN<\/button>/g, '<button class="bg-secondary-fixed text-on-secondary-fixed px-6 font-bold hover:bg-secondary transition-colors" data-i18n="join">JOIN</button>');

    // Footer Copyright and Links
    content = content.replace(/© 2024 Belts Store( Industrial)?\. All Rights Reserved\.( Powering Industrial Excellence\.)?<\/p>/g, function(match) {
        return '<span data-i18n="copyright">© 2024 Belts Store. All Rights Reserved.</span></p>';
    });
    content = content.replace(/>Privacy Policy<\/a>/g, ' data-i18n="privacy_policy">Privacy Policy</a>');
    content = content.replace(/>Terms of Service<\/a>/g, ' data-i18n="terms_of_service">Terms of Service</a>');
    content = content.replace(/>Shipping &amp; Returns<\/a>/g, ' data-i18n="shipping_returns">Shipping &amp; Returns</a>');

    // Navigation links in footer
    content = content.replace(/>About Us<\/a>/g, ' data-i18n="nav_about">About Us</a>');
    content = content.replace(/>Products<\/a><\/li>/g, ' data-i18n="nav_products">Products</a></li>');
    content = content.replace(/>Our Clients<\/a>/g, ' data-i18n="nav_clients">Our Clients</a>');
    content = content.replace(/>Our Partners<\/a>/g, ' data-i18n="nav_partners">Our Partners</a>');
    content = content.replace(/>Contact Us<\/a>/g, ' data-i18n="nav_contact">Contact Us</a>');

    // Products page specific
    content = content.replace(/<h3 class="font-headline-lg text-lg font-bold text-primary">PRODUCT SEARCH<\/h3>/g, '<h3 class="font-headline-lg text-lg font-bold text-primary" data-i18n="product_search">PRODUCT SEARCH</h3>');
    content = content.replace(/<p class="font-technical-label text-\[11px\] uppercase text-on-surface-variant">Filter by Category<\/p>/g, '<p class="font-technical-label text-[11px] uppercase text-on-surface-variant" data-i18n="filter_by_category">Filter by Category</p>');
    content = content.replace(/placeholder="Search product name or ref\.\.\."/g, 'placeholder="Search product name or ref..." data-i18n-placeholder="search_product_placeholder"');
    content = content.replace(/<h4 class="font-headline-lg text-lg uppercase text-primary font-bold">No Products Found<\/h4>/g, '<h4 class="font-headline-lg text-lg uppercase text-primary font-bold" data-i18n="no_products_found">No Products Found</h4>');
    content = content.replace(/<p class="text-sm text-on-surface-variant max-w-sm mt-2">No components matched your current search parameters or category filter\. Try clearing the search or choosing another category\.<\/p>/g, '<p class="text-sm text-on-surface-variant max-w-sm mt-2" data-i18n="no_products_desc">No components matched your current search parameters or category filter. Try clearing the search or choosing another category.</p>');
    content = content.replace(/>Clear Filters<\/button>/g, ' data-i18n="clear_filters">Clear Filters</button>');
    content = content.replace(/TOTAL FOUND:/g, '<span data-i18n="total_found">TOTAL FOUND:</span>');

    // Categories in Footer
    content = content.replace(/>Belt Power Transmission<\/a>/g, ' data-i18n="belt_power_transmission_cat">Belt Power Transmission</a>');
    content = content.replace(/>Pulleys<\/a><\/li>/g, ' data-i18n="nav_cat_pulleys">Pulleys</a></li>');
    content = content.replace(/>Bearings<\/a><\/li>/g, ' data-i18n="nav_cat_bearings">Bearings</a></li>');
    content = content.replace(/>Transmission Chains<\/a>/g, ' data-i18n="chains_sprockets">Transmission Chains</a>');

    fs.writeFileSync(filePath, content);
});
console.log('Added footer and sidebar data-i18n attributes successfully.');
