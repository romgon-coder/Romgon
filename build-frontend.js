#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Copying frontend files to root...');

const frontendDir = path.join(__dirname, 'frontend');
const rootDir = __dirname;

function copyFiles(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory not found: ${src}`);
    return;
  }

  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    // Skip node_modules and .git
    if (file === 'node_modules' || file === '.git' || file === 'vercel.json') {
      return;
    }

    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyFiles(srcPath, destPath);
    } else {
      console.log(`Copying ${file}...`);
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  copyFiles(frontendDir, rootDir);
  console.log('✅ Frontend files copied successfully');
  process.exit(0);
} catch (err) {
  console.error('❌ Error copying files:', err);
  process.exit(1);
}
