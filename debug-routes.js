const fs = require('fs');
const path = require('path');

console.log('=== Next.js Route Debug ===\n');

const appDir = path.join(__dirname, 'app');
console.log('App directory exists:', fs.existsSync(appDir));
console.log('App directory is symlink:', fs.lstatSync(appDir).isSymbolicLink());

if (fs.lstatSync(appDir).isSymbolicLink()) {
  console.log('Symlink target:', fs.readlinkSync(appDir));
}

console.log('\nApp directory contents:');
const items = fs.readdirSync(appDir);
items.forEach(item => {
  const fullPath = path.join(appDir, item);
  const stats = fs.lstatSync(fullPath);
  console.log(`  ${item} - ${stats.isDirectory() ? 'DIR' : 'FILE'}`);
});

console.log('\nChecking page.tsx:');
const pagePath = path.join(appDir, 'page.tsx');
console.log('  Exists:', fs.existsSync(pagePath));
console.log('  Can read:', fs.readFileSync(pagePath, 'utf8').substring(0, 50) + '...');

console.log('\nChecking layout.tsx:');
const layoutPath = path.join(appDir, 'layout.tsx');
console.log('  Exists:', fs.existsSync(layoutPath));
console.log('  Can read:', fs.readFileSync(layoutPath, 'utf8').substring(0, 50) + '...');

console.log('\n=== Debug Complete ===');
