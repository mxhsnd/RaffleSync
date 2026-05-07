import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },
  server: {
    host: true,
    allowedHosts: [
      'laptop-ctbv5dg7.tail05ea14.ts.net',
    ],
  },
})
