import { test, expect } from '@playwright/test';

test('has MapGuesser title', async ({ page }) => {
	await page.goto('http://localhost:8000/');

	await expect(page).toHaveTitle('MapGuesser');
});

test('start game button renders', async ({ page }) => {
	await page.goto('http://localhost:8000/');

	const startGameButton = await page.getByRole('button', { name: 'Start Game!' });
	await expect(startGameButton).toBeVisible();
});

