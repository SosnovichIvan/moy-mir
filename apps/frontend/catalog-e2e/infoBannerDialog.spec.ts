import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme} FE17 layout at ${width}`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=info-banner--${theme}&viewMode=story`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'InfoBanner',
      );
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      for (const banner of await page.locator('.mm-info-banner').all()) {
        const box = await banner.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await expect(
        page.locator('.mm-info-banner[data-state="loading"] button'),
      ).toHaveCount(0);
      await page.getByRole('button', { name: 'Обновить результат' }).click();
      await expect(
        page
          .getByRole('region', { name: 'Обновление результата' })
          .locator('[aria-live]'),
      ).toHaveText('Готово. Список обновлён.');
      await page.screenshot({
        path: info.outputPath('banner.png'),
        fullPage: true,
      });
      await page.goto(`/iframe.html?id=dialog--${theme}&viewMode=story`);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page
        .getByRole('button', { name: 'Открыть диалог', exact: true })
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName('Отменить заявку?');
      await expect(
        dialog.getByRole('button', { name: 'Оставить' }),
      ).toBeFocused();
      const box = await dialog.boundingBox();
      expect(box!.width).toBe(width < 768 ? Math.min(358, width - 32) : 480);
      await page.screenshot({ path: info.outputPath('dialog.png') });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Открыть диалог', exact: true }),
      ).toBeFocused();
    });
  }
  test(`${theme} native modal keyboard and request lifecycle`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=dialog--${theme}&viewMode=story`);
    await page.clock.install();
    await page
      .getByRole('checkbox', { name: 'Проверить удаление инициатора' })
      .check();
    await page
      .getByRole('button', { name: 'Открыть диалог', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await page.mouse.click(1, 1);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Оставить' }).focus();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(
        await dialog.evaluate((n) => n.contains(document.activeElement)),
      ).toBe(true);
    }
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(
        await dialog.evaluate((n) => n.contains(document.activeElement)),
      ).toBe(true);
    }
    const initial = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 400);
    expect(await page.evaluate(() => scrollY)).toBe(initial);
    await dialog
      .getByRole('button', { name: 'Отменить заявку', exact: true })
      .click();
    await expect(
      dialog.getByRole('button', { name: 'Подождите…' }),
    ).toBeDisabled();
    await dialog.getByRole('button', { name: 'Оставить' }).click();
    await expect(dialog).not.toBeVisible();
    await page.clock.fastForward(800);
    await expect(page.getByRole('status')).toContainText(
      'Операция завершилась ошибкой',
    );
    await page
      .getByRole('button', { name: 'Открыть диалог', exact: true })
      .click();
    await expect(dialog.getByRole('alert')).toContainText(
      'Не удалось отменить',
    );
    await dialog
      .getByRole('button', { name: 'Отменить заявку', exact: true })
      .click();
    await expect(dialog.getByRole('alert')).toBeEmpty();
    await page.clock.fastForward(800);
    await expect(dialog.getByRole('alert')).toContainText(
      'Не удалось отменить',
    );
    await dialog.getByRole('button', { name: 'Убрать инициатор' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });
}
test('long modal scrolls, preserves draft on error and reflows at 200%', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto('/iframe.html?id=dialog--light&viewMode=story');
  await page.getByRole('button', { name: 'Открыть длинный диалог' }).click();
  const dialog = page.getByRole('dialog');
  const content = dialog.locator('.mm-dialog-content');
  expect(await content.evaluate((n) => n.scrollHeight > n.clientHeight)).toBe(
    true,
  );
  await dialog.getByRole('textbox', { name: 'Причина' }).fill('Передумал');
  await dialog
    .getByRole('button', { name: 'Отменить заявку', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText('Не удалось отменить');
  await expect(dialog.getByRole('textbox', { name: 'Причина' })).toHaveValue(
    'Передумал',
  );
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  const box = await dialog.boundingBox();
  expect(box!.width).toBe(288);
  expect(await dialog.evaluate((n) => n.scrollWidth <= n.clientWidth)).toBe(
    true,
  );
  await dialog
    .getByRole('button', { name: 'Оставить' })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('dialog-zoom.png') });
  await dialog.getByRole('button', { name: 'Оставить' }).click();
  await expect(dialog).not.toBeVisible();
});
test('forced colors and banner 200% keep content reachable', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=info-banner--dark&viewMode=story');
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('banner-forced-zoom.png'),
    fullPage: true,
  });
  await page.goto('/iframe.html?id=dialog--dark&viewMode=story');
  await page
    .getByRole('button', { name: 'Открыть диалог', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCSS('border-top-width', '1px');
  await page.keyboard.press('Escape');
});
