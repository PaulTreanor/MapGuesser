import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e-tests',
  timeout: 60000,
  use: {
		baseURL: 'http://localhost:8000',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				browserName: 'chromium',
			},
		},
	],

});
