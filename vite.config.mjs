import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path'
import fs from 'fs';


const htmlPlugin = () => {
  return {
    name: 'html-transform',
    async closeBundle() {
      const htmlFiles = ['app.html', 'login.html', 'register.html'];

      for (const file of htmlFiles) {
        const filePath = path.resolve(__dirname, 'dist', 'prerendered-htmls', file);
        const fileNameWithoutExt = path.basename(file, '.html');
        const destDir = path.resolve(__dirname, 'dist', fileNameWithoutExt);
        const destPath = path.join(destDir, 'index.html');

        if (fs.existsSync(filePath)) {
          // Create the destination directory if it doesn't exist
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          // Move the HTML file to the new directory
          fs.renameSync(filePath, destPath);

          console.log(`Moved ${file} to ${fileNameWithoutExt}/index.html`);
        }
      }
    },
  };
};


export default defineConfig({
    plugins: [ react(), htmlPlugin() ],
    server: {
        port: 3000
    },
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            worker: resolve(__dirname, 'src/service-worker.js'),
            app: resolve(__dirname, 'prerendered-htmls/app.html'),
            login: resolve(__dirname, 'prerendered-htmls/login.html'),
            register: resolve(__dirname, 'prerendered-htmls/register.html'),
            
          },
          output: {
            entryFileNames: assetInfo => {

              if (assetInfo.name === 'worker') 
                return 'service-worker.js'

              return 'assets/[name]-[hash].js'
            }
          }
        },
      emptyOutDir: true
    }

});