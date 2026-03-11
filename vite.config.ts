import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router')) {
            return 'react-vendor'
          }

          if (id.includes('/motion/')) {
            return 'motion'
          }

          if (id.includes('@radix-ui')) {
            return 'radix'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('date-fns')) {
            return 'date'
          }

          return undefined
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
