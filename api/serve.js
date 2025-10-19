const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Get the requested file path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query strings
  filePath = filePath.split('?')[0];
  
  // Construct full path
  const fullPath = path.join(__dirname, '..', 'frontend', filePath);
  
  // Security: prevent directory traversal
  const realPath = path.resolve(fullPath);
  const frontendDir = path.resolve(path.join(__dirname, '..', 'frontend'));
  
  if (!realPath.startsWith(frontendDir)) {
    res.status(403).end('Forbidden');
    return;
  }
  
  // Try to serve the file
  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Try index.html in the directory
        const indexPath = path.join(fullPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fs.readFileSync(indexPath));
        } else {
          res.status(404).end('Not Found');
        }
      } else {
        // Determine content type
        const ext = path.extname(fullPath).toLowerCase();
        const contentTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.eot': 'application/vnd.ms-fontobject'
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.end(fs.readFileSync(fullPath));
      }
    } else {
      // File not found, serve index.html (for SPA routing)
      const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
      if (fs.existsSync(indexPath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(fs.readFileSync(indexPath));
      } else {
        res.status(404).end('Not Found');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).end('Internal Server Error');
  }
};
