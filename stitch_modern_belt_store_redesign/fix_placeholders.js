const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace Search Part Number...
    // The negative lookahead ensures it's not followed by ' data-i18n-placeholder'
    const searchRegex = /placeholder="Search Part Number..."(?!\s*data-i18n-placeholder)/g;
    if (content.match(searchRegex)) {
        content = content.replace(searchRegex, 'placeholder="Search Part Number..." data-i18n-placeholder="search_placeholder"');
        changed = true;
    }
    
    // Replace Email Address (exact casing)
    const emailRegex1 = /placeholder="Email Address"(?!\s*data-i18n-placeholder)/g;
    if (content.match(emailRegex1)) {
        content = content.replace(emailRegex1, 'placeholder="Email Address" data-i18n-placeholder="email_placeholder"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated placeholders in ${file}`);
    }
});
