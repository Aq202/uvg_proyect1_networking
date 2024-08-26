import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'strophe.js': path.resolve(__dirname, 'node_modules/strophe.js'),
    }
  },
  define: {
    'process.env': {},
    global: {},
    "global.WebSocket": "window.WebSocket",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
