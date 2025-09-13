#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const adminFiles = [
  'src/app/admin/contacts/page.tsx',
  'src/app/admin/homepage/page.tsx', 
  'src/app/admin/orders/page.tsx',
  'src/app/admin/posts/page.tsx',
  'src/app/admin/seo/dashboard/page.tsx',
  'src/app/admin/seo/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/theme/page.tsx'
];

adminFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find return statement and wrap content properly
  const returnIndex = content.lastIndexOf('return (');
  if (returnIndex !== -1) {
    const beforeReturn = content.substring(0, returnIndex);
    const afterReturn = content.substring(returnIndex);
    
    // Replace return ( with return (<div className="space-y-6"><div className="p-6">
    const newAfterReturn = afterReturn.replace(
      'return (',
      'return (\n    <div className="space-y-6">\n      <div className="p-6">'
    );
    
    // Add closing divs before final )
    const finalContent = beforeReturn + newAfterReturn.replace(
      /(\s+)(\))\s*\}\s*$/,
      '$1      </div>\n    </div>\n  $2\n}'
    );
    
    fs.writeFileSync(filePath, finalContent);
    console.log(`Fixed ${filePath}`);
  }
});

console.log('All files fixed!');
