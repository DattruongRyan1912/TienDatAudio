const fs = require('fs');
const path = require('path');

// Load data files
const brandsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/brands.json'), 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8'));

// Helper functions
function getCategoryByName(name) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ').trim();
    return categoriesData.categories.find(cat => {
        const catName = cat.name.toLowerCase().replace(/\s+/g, ' ').trim();
        const catSlug = cat.slug.toLowerCase().replace(/\s+/g, ' ').trim();
        return catName === normalizedName || catSlug === normalizedName;
    });
}

function getBrandByName(name) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ').trim();
    return brandsData.brands.find(brand => {
        const brandName = brand.name.toLowerCase().replace(/\s+/g, ' ').trim();
        const brandSlug = brand.slug.toLowerCase().replace(/\s+/g, ' ').trim();
        return brandName === normalizedName || brandSlug === normalizedName;
    });
}

// Function to update product structure
function updateProductFile(filePath) {
    console.log(`Updating ${filePath}...`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Get the key (speakers, amplifiers, etc.)
    const key = Object.keys(data)[0];
    const products = data[key];
    
    if (!Array.isArray(products)) {
        console.log(`No products array found in ${filePath}`);
        return;
    }
    
    // Update each product
    products.forEach(product => {
        console.log(`Processing product: ${product.name}`);
        console.log(`  Current category: "${product.category}"`);
        console.log(`  Current brand: "${product.brand}"`);
        
        // Add category_id if not exists
        if (!product.category_id && product.category) {
            const category = getCategoryByName(product.category);
            if (category) {
                product.category_id = category.id;
                console.log(`  - Added category_id: ${category.id} for product: ${product.name}`);
            } else {
                console.log(`  - WARNING: Category not found for: "${product.category}" (product: ${product.name})`);
                // List available categories for debugging
                console.log(`    Available categories:`, categoriesData.categories.map(c => `"${c.name}"`));
            }
        } else if (product.category_id) {
            console.log(`  - Category ID already exists: ${product.category_id}`);
        }
        
        // Add brand_id if not exists
        if (!product.brand_id && product.brand) {
            const brand = getBrandByName(product.brand);
            if (brand) {
                product.brand_id = brand.id;
                console.log(`  - Added brand_id: ${brand.id} for product: ${product.name}`);
            } else {
                console.log(`  - WARNING: Brand not found for: "${product.brand}" (product: ${product.name})`);
                // List available brands for debugging
                console.log(`    Available brands:`, brandsData.brands.map(b => `"${b.name}"`));
            }
        } else if (product.brand_id) {
            console.log(`  - Brand ID already exists: ${product.brand_id}`);
        }
    });
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${filePath} successfully!`);
}

// Update all product files
const productFiles = [
    path.join(__dirname, '../data/products/speakers.json'),
    path.join(__dirname, '../data/products/amplifiers.json')
];

productFiles.forEach(file => {
    if (fs.existsSync(file)) {
        updateProductFile(file);
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log('Product structure update completed!');
