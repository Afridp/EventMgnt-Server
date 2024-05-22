const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');

const distPath = path.join(__dirname, 'dist');

// Remove existing dist directory if it exists
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distPath);

// Copy all files to dist directory, excluding node_modules and .git
ncp.limit = 16;
ncp(__dirname, distPath, {
  filter: (source) => {
    return !source.includes('node_modules') && !source.includes('.git') && !source.includes('dist');
  }
}, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Build completed successfully!');
});
