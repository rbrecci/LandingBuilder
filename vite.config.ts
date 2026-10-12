import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import clientPlugin from './scripts/vite-plugin-client.ts'

export default defineConfig({
  plugins: [react(), clientPlugin()],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    manifest: true,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
  },
})
