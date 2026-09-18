import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} foundations at ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=foundations--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        theme === 'light' ? 'rgb(243, 246, 240)' : 'rgb(16, 27, 23)',
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      for (const [size, control, icon] of [
        ['s', 44, 20],
        ['m', 48, 24],
        ['l', 56, 28],
      ] as const) {
        await expect(page.locator(`[data-control-size="${size}"]`)).toHaveCSS(
          'height',
          `${control}px`,
        );
        const element = page.locator(`.mm-icon[data-size="${size}"]`).first();
        await expect(element).toHaveCSS('width', `${icon}px`);
        await expect(element).toHaveCSS(
          'background-color',
          theme === 'light' ? 'rgb(49, 99, 76)' : 'rgb(145, 200, 163)',
        );
        await expect(element).not.toHaveCSS('mask-image', 'none');
      }
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() =>
          document.fonts.check('700 32px "Manrope Variable"', 'Свой круг'),
        ),
      ).toBe(true);
      expect(
        await page.evaluate(() =>
          document.fonts.check('400 16px "Inter Variable"', 'Друзья'),
        ),
      ).toBe(true);
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('link', { name: 'Открыть основы в Figma' }),
      ).toBeFocused();
      await expect(page.getByRole('link')).toHaveCSS('outline-width', '2px');
      expect(errors).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath('foundations.png'),
        fullPage: true,
      });
    });
  }
}

test('theme can change through story globals', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=foundations--overview&viewMode=story&globals=theme:dark',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto(
    '/iframe.html?id=foundations--overview&viewMode=story&globals=theme:light',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
