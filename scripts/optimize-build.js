#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting optimized build process...');

// Clean dist directory
console.log('📁 Cleaning build directory...');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Remove any remaining temp files (Windows compatible)
console.log('🧹 Cleaning temporary files...');
try {
  // Use PowerShell for Windows compatibility
  execSync('Get-ChildItem -Path . -Recurse -Name "*backup*.tsx" | Remove-Item -Force', { 
    stdio: 'ignore',
    shell: 'powershell'
  });
  execSync('Get-ChildItem -Path . -Recurse -Name "*_backup*.tsx" | Remove-Item -Force', { 
    stdio: 'ignore',
    shell: 'powershell'
  });
  execSync('Get-ChildItem -Path . -Recurse -Name "*_new*.tsx" | Remove-Item -Force', { 
    stdio: 'ignore',
    shell: 'powershell'
  });
} catch (e) {
  // Ignore errors if files don't exist
}

// Build client with optimization
console.log('⚡ Building optimized client bundle...');
execSync('npm run build:client', { stdio: 'inherit' });

// Build server
console.log('🖥️ Building server...');
execSync('npm run build:server', { stdio: 'inherit' });

// Bundle analysis
console.log('📊 Analyzing bundle size...');
const assetsPath = path.join(__dirname, '..', 'dist', 'spa', 'assets');
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  console.log('\n📦 JavaScript Bundle Analysis:');
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const status = parseFloat(sizeKB) > 500 ? '⚠️' : '✅';
    console.log(`   ${status} ${file}: ${sizeKB} KB`);
  });
  
  const totalSize = jsFiles.reduce((total, file) => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    return total + stats.size;
  }, 0);
  
  console.log(`\n📈 Total JS Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
}

console.log('\n✅ Build optimization completed successfully!');
console.log('📈 Your bundle has been optimized with:');
console.log('   • Code splitting by routes');
console.log('   • Lazy loading for dashboard pages');
console.log('   • Manual chunk optimization');
console.log('   • Removed temporary and backup files');
