import { test, expect } from '@playwright/test';

test('game run through', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    const singlePlayerCard = page.getByText("Single Player Game");
    await expect(singlePlayerCard).toBeVisible();

    await singlePlayerCard.click();

	const startGameButton = await page.getByRole('button', { name: 'Start Game!' });
    await expect(startGameButton).toBeVisible();

    await startGameButton.click();

	const locationText = await page.getByText(/Where is .+\?/);
    await expect(locationText).toBeVisible();

    const firstRoundConterText = await page.getByText("Round 1/5");
    await expect(firstRoundConterText).toBeVisible();

	const mapCanvas = await page.locator('.mapboxgl-canvas');
    await mapCanvas.click();

    const nextRoundButton = await page.getByRole('button', { name: 'Next Round' });
    await expect(nextRoundButton).toBeVisible();

    await nextRoundButton.click();
    
    // await page.waitForTimeout(1000);

    const secondRoundConterText = await page.getByText("Round 2/5");
    await expect(secondRoundConterText).toBeVisible();

    await mapCanvas.click();

    await expect(nextRoundButton).toBeVisible();

    await nextRoundButton.click();
    

    const thirdRoundConterText = await page.getByText("Round 3/5");
    await expect(thirdRoundConterText).toBeVisible();

    await mapCanvas.click();

    await expect(nextRoundButton).toBeVisible();

    await nextRoundButton.click();

    const fourthRoundConterText = await page.getByText("Round 4/5");
    await expect(fourthRoundConterText).toBeVisible();

    await mapCanvas.click();

    await expect(nextRoundButton).toBeVisible();

    await nextRoundButton.click();

    const fifthRoundConterText = await page.getByText("Round 5/5");
    await expect(fifthRoundConterText).toBeVisible();

    await mapCanvas.click();

	const finishGameButton = await page.getByRole('button', { name: 'Finish Game' });
    await expect(finishGameButton).toBeVisible();

    await finishGameButton.click();

    const gameOverText = await page.getByText(/Your final score is/);
    await expect(gameOverText).toBeVisible();

    const playAgainButton = await page.getByRole('button', { name: 'Play again' });
    await expect(playAgainButton).toBeVisible();

    await playAgainButton.click();

    await expect(startGameButton).toBeVisible();

});

