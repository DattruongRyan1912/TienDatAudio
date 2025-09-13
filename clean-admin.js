#!/usr/bin/env node

const fs = require('fs');

const adminFiles = [
  'src/app/admin/orders/page.tsx',
  'src/app/admin/posts/page.tsx',
  'src/app/admin/seo/dashboard/page.tsx',
  'src/app/admin/seo/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/theme/page.tsx'
];

adminFiles.forEach(filePath => {
  console.log(`Cleaning ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove duplicate wrapper divs from script
  content = content.replace(/return \(\s*<div className="space-y-6">\s*<div className="p-6">/g, 'return (\n    <div className="p-6">');
  
  // Fix closing divs - remove extra closing divs at the end
  content = content.replace(/(\s+)<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/g, '$1</div>\n  )\n}');
  
  // Clean up extra closing divs before the final return
  content = content.replace(/(\s+)<\/div>\s+<\/div>\s+<\/div>\s+\)\s*\}/g, '$1</div>\n  )\n}');
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${filePath}`);
});

console.log('All files cleaned!');
