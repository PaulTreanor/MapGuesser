/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
  resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
  test: {
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    environment: 'jsdom',
    watch: false,
    include: ['./src/tests/**/*.test.*']
  },
})
