import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'



export default defineConfig({
    plugins: [ react() ],
    server: {
        port: 3000
    },
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            worker: resolve(__dirname, 'src/service-worker.js'),
          },
          output: {
            entryFileNames: assetInfo => {
              // output popup-related files normally
              if (assetInfo.name === 'worker') return 'service-worker.js'
              return 'assets/[name]-[hash].js'
            }
          }
        },
      emptyOutDir: true
    }

});