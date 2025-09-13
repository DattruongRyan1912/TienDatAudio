#!/usr/bin/env node

const fs = require('fs');

// Function to fix admin pages structure
function fixAdminPage(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove wrongly placed function closures like ") }"
  content = content.replace(/\s*\)\s*\}\s*\n\s*{\/\*/g, '\n\n        {/*');
  content = content.replace(/\s*\)\s*\}\s*\n\s*(\w|\{)/g, '\n\n        $1');
  
  // Fix malformed structures
  content = content.replace(/\s*\)\s*\}\s*$/g, '');
  
  // Ensure proper closing
  if (!content.trim().endsWith(')')) {
    // Add proper closing based on opening divs count
    const openDivs = (content.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    const missingDivs = openDivs - closeDivs;
    
    let closingDivs = '';
    for (let i = 0; i < missingDivs; i++) {
      closingDivs += '      </div>\n';
    }
    
    if (!content.trim().endsWith('  )')) {
      content = content.trim() + '\n' + closingDivs + '    </div>\n  )\n}';
    } else {
      content = content.trim() + '\n}';
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Files to fix
const filesToFix = [
  'src/app/admin/theme/page.tsx',
  'src/app/admin/seo/page.tsx'
];

filesToFix.forEach(fixAdminPage);

console.log('All files fixed!');
