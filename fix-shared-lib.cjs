const fs = require('fs');
const path = require('path');

function fixSharedLibImports(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
        fixSharedLibImports(fullPath);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let hasChanges = false;
        
        // Fix @/shared/lib/ imports to @/lib/
        if (content.includes('@/shared/lib/')) {
          content = content.replace(/@\/shared\/lib\//g, '@/lib/');
          hasChanges = true;
        }
        
        if (hasChanges) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ Fixed: ${fullPath}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

console.log('🔧 Fixing @/shared/lib imports...');
fixSharedLibImports('./client');
console.log('✅ Finished fixing shared lib imports!');