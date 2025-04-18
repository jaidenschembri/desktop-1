import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd ? '/desktop/' : '/', // 👈 dynamic base path
  server: {
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true
  },
  publicDir: 'public',
  plugins: [
    {
      name: 'add-nojekyll',
      closeBundle() {
        const noJekyllPath = path.resolve(__dirname, 'dist/.nojekyll');
        fs.writeFileSync(noJekyllPath, '');
        console.log('✅ .nojekyll file created in dist/');
      }
    }
  ]
});
