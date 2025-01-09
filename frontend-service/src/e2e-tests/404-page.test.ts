import { test, expect } from '@playwright/test';

test('proper 404 page renders', async ({ page }) => {
	await page.goto('http://localhost:8000/404');

	const pageNotFoundMessage = await page.getByText('Page not found 😐')
	await expect(pageNotFoundMessage).toHaveCount(1)

	const goBackHomeButton = await page.getByRole('button', { name: 'Go back home' });
	await expect(goBackHomeButton).toBeVisible();
});