import { test, expect } from '@playwright/test';

test('has MapGuesser title', async ({ page }) => {
	await page.goto('http://localhost:8000/');

	await expect(page).toHaveTitle('MapGuesser');
});

