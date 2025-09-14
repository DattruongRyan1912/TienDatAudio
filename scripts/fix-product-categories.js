const fs = require('fs');
const path = require('path');

// Read categories and brands from API data
const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8'));
const brandsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/brands.json'), 'utf8'));

// Create mapping objects
const categoryMap = {};
const brandMap = {};

categoriesData.categories.forEach(cat => {
  categoryMap[cat.id] = cat.name;
  categoryMap[cat.slug] = cat.name;
  categoryMap[cat.name.toLowerCase()] = cat.name;
});

brandsData.brands.forEach(brand => {
  brandMap[brand.id] = brand.name;
  brandMap[brand.slug] = brand.name;
  brandMap[brand.name.toLowerCase()] = brand.name;
});

console.log('Category mappings:', categoryMap);
console.log('Brand mappings:', brandMap);

// Function to fix product data
function fixProductData(products) {
  return products.map(product => {
    const fixed = { ...product };
    
    // Fix category name to match API
    if (fixed.category && fixed.category_id) {
      const correctCategoryName = categoryMap[fixed.category_id];
      if (correctCategoryName && fixed.category !== correctCategoryName) {
        console.log(`Fixing category: "${fixed.category}" -> "${correctCategoryName}" for product ${fixed.name}`);
        fixed.category = correctCategoryName;
      }
    }
    
    // Fix brand name to match API
    if (fixed.brand && fixed.brand_id) {
      const correctBrandName = brandMap[fixed.brand_id];
      if (correctBrandName && fixed.brand !== correctBrandName) {
        console.log(`Fixing brand: "${fixed.brand}" -> "${correctBrandName}" for product ${fixed.name}`);
        fixed.brand = correctBrandName;
      }
    }
    
    return fixed;
  });
}

// Process speakers.json
try {
  const speakersPath = path.join(__dirname, '../data/products/speakers.json');
  const speakersData = JSON.parse(fs.readFileSync(speakersPath, 'utf8'));
  
  console.log('\n=== Processing speakers.json ===');
  const fixedSpeakers = fixProductData(speakersData.speakers);
  
  fs.writeFileSync(speakersPath, JSON.stringify({ speakers: fixedSpeakers }, null, 2));
  console.log('✅ speakers.json updated');
} catch (error) {
  console.error('Error processing speakers.json:', error);
}

// Process amplifiers.json
try {
  const amplifiersPath = path.join(__dirname, '../data/products/amplifiers.json');
  const amplifiersData = JSON.parse(fs.readFileSync(amplifiersPath, 'utf8'));
  
  console.log('\n=== Processing amplifiers.json ===');
  const fixedAmplifiers = fixProductData(amplifiersData.amplifiers);
  
  fs.writeFileSync(amplifiersPath, JSON.stringify({ amplifiers: fixedAmplifiers }, null, 2));
  console.log('✅ amplifiers.json updated');
} catch (error) {
  console.error('Error processing amplifiers.json:', error);
}

console.log('\n🎉 Product data consistency check completed!');
