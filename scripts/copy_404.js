import fs from 'fs';
import path from 'path';

// Run after build
const dist = path.resolve('dist');
const index = path.join(dist, 'index.html');
const fallback = path.join(dist, '404.html');

if (fs.existsSync(index)) {
    fs.copyFileSync(index, fallback);
    fs.writeFileSync(path.join(dist, '.nojekyll'), '');
    console.log('✅ Copied index.html to 404.html and created .nojekyll for GitHub Pages SPA support');
} else {
    console.error('❌ dist/index.html not found!');
}
