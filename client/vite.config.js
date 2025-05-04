// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.vue'],
    }),
  ],
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        sassOptions: {
          logger: { silent: true },
          quietDeps: true,
          quiet: true
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
