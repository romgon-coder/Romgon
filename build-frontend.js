#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Copying deploy files to public directory...');

const deployDir = path.join(__dirname, 'deploy');
const publicDir = path.join(__dirname, 'public');

// Create public directory
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

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
    if (file === 'node_modules' || file === '.git') {
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
  // Copy deploy files
  copyFiles(deployDir, publicDir);
  
  const buildTime = new Date().toISOString();
  console.log('✅ Deploy files copied to public directory successfully');
  console.log(`📦 Build completed at: ${buildTime}`);
  console.log(`📁 Source: ${deployDir}`);
  console.log(`📁 Destination: ${publicDir}`);
  
  // Write build info file
  const buildInfo = {
    buildTime,
    version: '2024-10-20-22:00:00',
    sourceDir: deployDir,
    outputDir: publicDir
  };
  fs.writeFileSync(
    path.join(publicDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  console.log('📝 Build info written to build-info.json');
  
  process.exit(0);
} catch (err) {
  console.error('❌ Error copying files:', err);
  process.exit(1);
}
