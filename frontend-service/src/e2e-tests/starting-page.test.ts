import { test, expect } from '@playwright/test';

test('has MapGuesser title', async ({ page }) => {
	await page.goto('http://localhost:8000/');

	await expect(page).toHaveTitle('MapGuesser');
});

test('single player mode start game button renders', async ({ page }) => {
	await page.goto('http://localhost:8000/');

	const singlePlayerCard = page.getByText("Single Player Game");
    await expect(singlePlayerCard).toBeVisible();

    await singlePlayerCard.click();

	const startGameButton = await page.getByRole('button', { name: 'Start Game!' });
	await expect(startGameButton).toBeVisible();
});

