import { test, expect } from '@playwright/test';

test('has MapGuesser title', async ({ page }) => {
  await page.goto('http://localhost:8000/');

  await expect(page).toHaveTitle('MapGuesser');
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
