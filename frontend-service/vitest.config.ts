/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    environment: 'jsdom',
    watch: false,
  },
})